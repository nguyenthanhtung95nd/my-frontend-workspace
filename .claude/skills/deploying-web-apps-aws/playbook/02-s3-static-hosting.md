# 02 - S3 static hosting

S3 is the base layer -- every later service (CloudFront, ACM, Route 53) is a layer on a bucket. An
object is a key (`assets/app.js`) + data + metadata; slashes are virtual prefixes, not folders.

## Create a bucket (secure by default)
```bash
aws s3 mb s3://my-app-assets --region us-east-1
# non-us-east-1 needs: aws s3api create-bucket --bucket <n> --region <r> \
#   --create-bucket-configuration LocationConstraint=<r>
```
Bucket names are **globally unique** and cannot be renamed (hard-to-reverse). Modern defaults (2023+)
are already safe: all four Block Public Access settings ON, ACLs disabled, SSE-S3 (AES256) on. Ignore
old `--acl public-read` advice. Verify with `get-public-access-block`, `get-bucket-encryption`.

## Upload / deploy
```bash
aws s3 sync ./build s3://my-app-assets --delete --exclude "*.map"
aws s3 cp app.js s3://my-app-assets/app.js --content-type "application/javascript"
```
`sync` transfers only changed files; `--delete` makes the build dir the source of truth (a broken
build wipes the bucket -- always build first). **The CLI guesses MIME by extension and misses
`.woff2`/`.webp`/`.mjs`** -- a wrong type makes the browser refuse to run your JS; set `--content-type`
or verify with `head-object`. Use content-hashed filenames for cache-busting. SDK path (app work, not
infra): `PutObjectCommand`, pre-signed URLs for direct client uploads (needs bucket CORS), and
`@aws-sdk/lib-storage` `Upload` for large files.

## Public hosting vs the private-behind-CloudFront pattern
The S3 **website endpoint** (`http://bucket.s3-website-<region>.amazonaws.com`) is HTTP-only and needs
a public bucket (disable BPA + a `Principal: "*"` `s3:GetObject` policy on `bucket/*`). Prefer the
**private + CloudFront + OAC** pattern instead (see [03-cloudfront-cdn.md](03-cloudfront-cdn.md)) --
it gives HTTPS, caching, security headers, and keeps the bucket private. If you must do S3 static
hosting directly, set the error document to `index.html` for SPA fallback (but it still returns HTTP
404 status).

> Bucket policy `Resource` MUST end in `/*` for object grants; an explicit `Deny` beats any Allow;
> account-level BPA overrides the bucket. Public buckets are a top AWS incident -- never for sensitive
> data.

## Versioning and lifecycle (rollback safety + cost control)
S3 is last-write-wins with no undo. Enable versioning in the same pass as the first deploy so the
first overwrite is already recoverable:
```bash
aws s3api put-bucket-versioning --bucket my-app-assets --versioning-configuration Status=Enabled
```
Versioning can only be **suspended**, never disabled (hard-to-reverse). Roll back with
`list-object-versions` + `get-object --version-id`. Cap the cost of old versions with a lifecycle rule
(`NoncurrentVersionExpiration: { NoncurrentDays: 7 }`, optionally transition to `STANDARD_IA`) via
`put-bucket-lifecycle-configuration`. Pricing is roughly Standard $0.023/GB-mo, PUT $0.005/1k, GET
$0.0004/1k (first 100 GB egress free). **Teardown must delete all versions AND delete markers** before
`s3 rb`.
