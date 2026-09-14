#!/usr/bin/env bash
# Static-site deploy: build -> upload with tiered cache headers -> invalidate CloudFront.
# Requires IAM: s3:PutObject, s3:DeleteObject, s3:ListBucket, cloudfront:CreateInvalidation.
set -euo pipefail

BUCKET="${BUCKET:?set BUCKET}"                 # e.g. my-app-assets
DIST_ID="${DIST_ID:?set DIST_ID}"             # CloudFront distribution id
BUILD_DIR="${BUILD_DIR:-dist}"

# Build first: --delete makes BUILD_DIR the source of truth, so a broken build must not run.
npm run build
[ -d "$BUILD_DIR" ] || { echo "build dir '$BUILD_DIR' missing"; exit 1; }

# 1) Hashed, immutable assets - cache for a year.
aws s3 sync "$BUILD_DIR/assets" "s3://$BUCKET/assets" \
  --cache-control "public, max-age=31536000, immutable" --delete

# 2) index.html - short TTL so a deploy is visible fast.
aws s3 cp "$BUILD_DIR/index.html" "s3://$BUCKET/index.html" \
  --cache-control "public, max-age=60" --content-type "text/html"

# 3) Everything else (favicon, robots, manifest) - exclude what phases 1-2 handled.
aws s3 sync "$BUILD_DIR" "s3://$BUCKET" \
  --exclude "assets/*" --exclude "index.html" --delete

# 4) Purge the edge cache (first 1,000 paths/month free; "/*" counts as one path).
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" \
  --query 'Invalidation.Id' --output text
