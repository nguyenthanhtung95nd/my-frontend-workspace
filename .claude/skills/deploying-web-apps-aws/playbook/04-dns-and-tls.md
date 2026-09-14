# 04 - DNS and TLS

## DNS resolution model
Chain: browser cache -> OS cache -> recursive resolver -> root -> TLD -> authoritative nameserver -> IP.
TTL controls cache lifetime (300s is a sensible default behind CloudFront; drop to 60s a day before a
migration). Route 53 is AWS's authoritative DNS. Debug with `dig example.com +short` and
`dig example.com @<nameserver>` to bypass caches and isolate propagation from config. Blaming
"propagation" for every issue is the classic mistake -- caches live at multiple layers.

## Hosted zones and records
```bash
aws route53 create-hosted-zone --name example.com --caller-reference "setup-$(date +%s)"
```
Returns a zone id + 4 nameservers and auto-creates NS + SOA records -- **never delete those**. Record
types: A/AAAA (address), CNAME (name -> name, illegal at the apex), MX (mail), TXT (verification).
Manage records with `change-resource-record-sets` using `UPSERT` (idempotent) over `CREATE`. A hosted
zone costs ~$0.50/month + queries (free if deleted within 12h). Route 53 is authoritative only after
the registrar delegates to its nameservers.

## Alias vs CNAME (use alias for AWS targets)
A CNAME cannot live at the zone apex (RFC 1034), but you must serve the bare domain. Route 53 **alias**
records look like a plain A/AAAA externally but resolve an AWS resource internally -- so they work at
the apex, and queries to AWS targets are free.
```json
{ "Action": "UPSERT", "ResourceRecordSet": { "Name": "example.com", "Type": "A",
  "AliasTarget": { "HostedZoneId": "Z2FDTNDATAQYW2", "DNSName": "<dist>.cloudfront.net",
                   "EvaluateTargetHealth": false } } }
```
`Z2FDTNDATAQYW2` is the **fixed** hosted-zone id for *any* CloudFront distribution (not your zone id).
Add an AAAA alias too for IPv6, and batch apex + `www` in one change. The domain must be listed as an
**alternate domain name** on the distribution, or you get "Alias target name does not lie within the
target zone".

## Domains (hard-to-reverse, annual cost)
Register via Route 53 (the `route53domains` API is **us-east-1 only**) -- it auto-creates a zone and
sets nameservers. Transfers need an unlock + auth code and take 5-7 days (not allowed within 60 days of
registration). External-registrar path: create a zone, copy its 4 nameservers into the registrar, and
recreate existing MX/TXT records. Duplicate zones with mismatched nameservers make records invisible.

## ACM certificates (us-east-1 for CloudFront)
```bash
aws acm request-certificate --domain-name example.com \
  --subject-alternative-names "*.example.com" --validation-method DNS \
  --region us-east-1 --query CertificateArn --output text
```
The certificate **must be in us-east-1** for CloudFront (its control plane is there; the same applies
to WAF and Lambda@Edge) -- a cert in another region simply cannot be attached. ALB/API Gateway instead
need the cert in *their* region. Public ACM certs are free.

**DNS validation** is the only method that auto-renews. Get the record, add it, and wait:
```bash
aws acm describe-certificate --certificate-arn <arn> \
  --query "Certificate.DomainValidationOptions[*].ResourceRecord"     # add this CNAME (UPSERT, TTL 300)
aws acm wait certificate-validated --certificate-arn <arn>            # ~40 min timeout = DNS is wrong
```
Apex + `*.example.com` usually share **one** validation CNAME. Certs are valid 13 months and ACM
reissues in place (same ARN, zero downtime) ~60 days before expiry -- but only while the validation
CNAME stays in DNS and the cert stays attached to a live resource. **Never delete the validation
CNAME**, and don't use email validation (it does not auto-renew and can silently expire the site).

## Wildcards and multiple domains
`*.example.com` covers one-level subdomains but **not** the apex or two-level (`beta.staging.example.com`).
A SAN cert enumerates exact hostnames (`--subject-alternative-names www... api...`), 10 domains by
default. You cannot add a domain to an existing cert -- request a new one and swap it on CloudFront.
