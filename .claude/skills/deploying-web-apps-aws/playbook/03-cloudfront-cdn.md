# 03 - CloudFront (CDN)

CloudFront caches at edge locations and gives HTTPS + a private origin. The browser talks only to the
edge, never to S3 directly.

## Distribution with a private origin (OAC)
Point CloudFront at the S3 **REST** endpoint (`bucket.s3.<region>.amazonaws.com`, NOT the
`s3-website-` endpoint) and lock the bucket private with Origin Access Control:
```bash
aws cloudfront create-origin-access-control --origin-access-control-config \
  '{"Name":"app-oac","SigningProtocol":"sigv4","SigningBehavior":"always","OriginAccessControlOriginType":"s3"}'
```
On the origin, set `OriginAccessControlId` and an **empty** `S3OriginConfig.OriginAccessIdentity`.
Then the bucket policy trusts the CloudFront service principal, scoped to the distribution:
```json
{ "Effect": "Allow", "Principal": { "Service": "cloudfront.amazonaws.com" },
  "Action": "s3:GetObject", "Resource": "arn:aws:s3:::my-app-assets/*",
  "Condition": { "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::ACCT:distribution/ID" } } }
```
**Re-enable Block Public Access afterward** -- a service-principal policy is not "public". Prefer OAC
over legacy OAI. Verify: `curl` the S3 REST endpoint -> expect `403`, CloudFront -> `200`.

Useful managed policy IDs (reusable constants): CachingOptimized cache policy
`658327ea-f89d-4fab-a63d-7e88639e58f6`; SecurityHeadersPolicy response-headers policy
`67f7725c-6f97-4210-82d7-5512b31e9d03`. Set `ViewerProtocolPolicy: redirect-to-https`,
`Compress: true`, `HttpVersion: http2and3`, `DefaultRootObject: index.html`, `PriceClass_100`.

Updates use optimistic concurrency: `get-distribution-config` -> capture `ETag` -> `update-distribution
--if-match <ETag>` (the ETag changes on every update). Wait with `aws cloudfront wait
distribution-deployed --id <id>`.

## Cache behaviors and invalidations
Behaviors match by path (most specific first, `*` last). CloudFront honors the origin `Cache-Control`
within the policy's min/max TTL. The right strategy for a hashed-asset build:
- hashed assets: `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `Cache-Control: public, max-age=60`
- invalidate `/*` on every deploy.
```bash
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```
Invalidations take 5-15 min (users see mixed versions meanwhile). First 1,000 paths/month are free
(`/*` counts as one path), then $0.005 each.

## Security headers and CORS
Attach the managed SecurityHeadersPolicy (or a custom one) for HSTS, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, and CSP -- these are absent by default and flagged by any audit. CSP is the
real XSS defense (`X-XSS-Protection` is dead). A CloudFront Function gives full control (e.g. HSTS
`preload`) -- see [09-edge-and-cicd.md](09-edge-and-cicd.md). Static same-origin sites need no CORS.

## SPA routing without a function
Deep links / refreshes on client routes otherwise hit the origin's error. Map **both 403 and 404** to
`/index.html` with response code `200` (under OAC, S3 returns 403 for a missing key, so the 403 mapping
is essential):
```json
"CustomErrorResponses": { "Items": [
  { "ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 10 },
  { "ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 10 } ] }
```
Trade-off: genuine 404s now return 200 (bad for SEO/monitoring) -- fix real status codes with an edge
function (see [09](09-edge-and-cicd.md)). Keep `ErrorCachingMinTTL` low (10s) or stale error pages
persist after a deploy.

## The repeatable deploy
Wrap it in a script (see [templates/deploy.sh](../templates/deploy.sh)): build -> `s3 sync` with tiered
cache headers -> `create-invalidation "/*"`. The deploy identity needs
`s3:PutObject`/`DeleteObject`/`ListBucket` + `cloudfront:CreateInvalidation` only.

> Cleanup trap: set the distribution `Enabled: false` and wait for `Deployed` **before**
> `delete-distribution`, or you get `DistributionNotDisabled` and the waiter looks stuck (disabling
> takes 15-30 min).
