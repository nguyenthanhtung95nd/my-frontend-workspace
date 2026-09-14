# Deploy audit scorecard

Score each item **present / partial / missing**, note the cost/risk, and fix security + cost gaps
first. Details per area live in [playbook/](playbook/).

## Account, IAM & CLI ([01](playbook/01-account-iam-cli.md))
- [ ] Root has MFA and no access keys; day-to-day work uses a non-root admin
- [ ] Deploy/execution roles are least-privilege (specific actions, single resource ARN)
- [ ] CloudTrail on; IAM Access Analyzer run; no `service:*` on `*`
- [ ] CLI via profiles (or SSO); stack stabilized -> moved to IaC (CDK)

## S3 ([02](playbook/02-s3-static-hosting.md))
- [ ] Block Public Access ON; bucket private (served via CloudFront/OAC, not public)
- [ ] Correct `Content-Type` on uploads (`.woff2`/`.webp`/`.mjs`); hashed filenames
- [ ] Versioning enabled; lifecycle rule expiring old versions

## CloudFront ([03](playbook/03-cloudfront-cdn.md))
- [ ] OAC in place; S3 REST endpoint returns 403, CloudFront 200
- [ ] Tiered cache headers (immutable assets, short-TTL index.html) + `/*` invalidation on deploy
- [ ] Security headers policy attached (HSTS, nosniff, frame-options, CSP)
- [ ] SPA routing (403+404 -> /index.html) or an edge function for real status codes

## DNS & TLS ([04](playbook/04-dns-and-tls.md))
- [ ] Apex + www via Route 53 **alias** (not CNAME); AAAA for IPv6
- [ ] ACM cert in **us-east-1** (for CloudFront), DNS-validated, validation CNAME left in place
- [ ] Auto-renewal eligible (cert attached to a live resource)

## Lambda ([05](playbook/05-lambda.md))
- [ ] esbuild bundle with `--external:@aws-sdk/*`; zipped from inside the output dir
- [ ] SDK clients initialized at module scope; memory/arch tuned for cold starts
- [ ] Per-function least-privilege role; **no secrets in env vars**

## API Gateway ([06](playbook/06-api-gateway.md))
- [ ] Integration + route + Lambda invoke permission all present
- [ ] CORS on the API (exact origins, custom headers listed); throttling set
- [ ] Protected routes have a JWT/authorizer; identity read from claims, not query params

## DynamoDB & secrets ([07](playbook/07-dynamodb-and-secrets.md))
- [ ] Keys designed from access patterns; `Query` (not `Scan`) in endpoints; pagination handled
- [ ] Table IAM scoped to the single table ARN
- [ ] Secrets in Parameter Store/Secrets Manager (SecureString + paired `kms:Decrypt`), cached at init

## Observability & cost ([08](playbook/08-observability-and-cost.md))
- [ ] Structured JSON logs; log-group **retention set** (not never-expire)
- [ ] Error/latency/5XX alarms -> SNS (subscription confirmed); correlation-id tracing
- [ ] Budget + billing alerts; Route 53/idle resources accounted for
- [ ] Teardown plan in reverse dependency order

## Edge & CI/CD ([09](playbook/09-edge-and-cicd.md))
- [ ] Smallest edge tool chosen (CloudFront Function unless network/npm/body/origin needed)
- [ ] CI deploys via **OIDC role assumption** (no static keys); trust `sub` scoped with `StringEquals`
- [ ] Pipeline runs sync + `/*` invalidation; least-privilege deploy role

> For a CDK-first serverless implementation of this whole stack, see the Taskly project
> (`taskly/` + `docs/learn-cdk.md`).
