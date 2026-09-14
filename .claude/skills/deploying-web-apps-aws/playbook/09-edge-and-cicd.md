# 09 - Edge and CI/CD

## Edge compute: pick the smallest capable tool
| | CloudFront Functions | Lambda@Edge |
|---|----------------------|-------------|
| Runtime | lightweight JS (`cloudfront-js-2.0`) | full Node.js/Python |
| Events | viewer-request / viewer-response only | all four (adds origin-request/response) |
| Limits | sub-ms, 2 MB mem, 10 KB code, **no network/modules** | up to 10,240 MB, network + npm + request body (origin) |
| Deploy | global, propagates in seconds | us-east-1, replicates in minutes |
| Cost | ~free (2M/mo) | $0.60/M + GB-s, **no free tier** |

Use a **CloudFront Function** for URL rewrites, redirects, security headers, basic auth, and simple
header work. Use **Lambda@Edge** only when you need npm packages, network access, the request body, or
origin changes (geo routing, JWT verification). "Choose neither" when a managed response-headers or
cache policy already does it. Neither supports user-defined env vars; Lambda@Edge forbids `$LATEST`
(reference a numbered version ARN) and its trust policy must allow both `lambda.amazonaws.com` and
`edgelambda.amazonaws.com`.

## Writing a CloudFront Function
```js
function handler(event) {
  var request = event.request;
  if (!request.uri.includes('.')) request.uri = '/index.html';   // SPA rewrite before the cache check
  return request;                                                // or return a synthetic response to short-circuit
}
```
Headers are `{ value }` objects with lowercase names; write **synchronous** code (async parses but has
no useful APIs); stay within 10 KB (move large data to a KeyValueStore). Lifecycle:
`create-function` (`--runtime cloudfront-js-2.0`) -> `test-function --stage DEVELOPMENT` (returns
`ComputeUtilization` -- keep well under 100) -> **`publish-function`** (promotes DEVELOPMENT to LIVE)
-> add `FunctionAssociations` (`FunctionARN` + `EventType`) to the behavior -> `update-distribution
--if-match <ETag>` -> `wait distribution-deployed`. `update-function` only touches DEVELOPMENT -- you
must publish again. Security headers belong on **viewer-response**, rewrites/redirects on
**viewer-request**.

## Writing a Lambda@Edge function
Create in **us-east-1** (`nodejs22.x`), `publish-version` (numbered), then associate the versioned ARN
with an `EventType`. Request at `event.Records[0].cf.request`; headers are arrays of `{ key, value }`;
`status` must be a **string** (`'404'`, not `404`). `authMethod: 'none'` is correct under OAC.
Debugging: logs land in the region nearest the executing edge (group `/aws/lambda/us-east-1.<fn>`).
Cleanup is slow -- disassociate, wait `Deployed`, then delete (replica cleanup can block deletion for
30-60+ min).

## Two edge patterns worth knowing
- **A/B testing without flicker:** a viewer-request function assigns a variant by cookie and rewrites
  `/` to `/a/index.html` or `/b/index.html`; a viewer-response function sets the `ab-variant` cookie.
  Cache separately per variant (distinct rewritten URIs make distinct cache keys).
- **Real SPA status codes:** a viewer-request CloudFront Function stashes `x-original-uri` before
  rewriting to `/index.html`; a Lambda@Edge viewer-response tests it against a `knownRoutes` list and
  sets `response.status = '404'` on no match (body stays the SPA shell) -- so crawlers/monitoring see
  the true status instead of a blanket 200.

## CI/CD with GitHub Actions (keyless via OIDC)
Deploy on push to `main` using **short-lived credentials from OIDC role assumption** -- no stored AWS
keys. Both AWS and GitHub recommend this over long-lived access keys.

**One-time AWS setup:** create the GitHub OIDC identity provider
(`token.actions.githubusercontent.com`, audience `sts.amazonaws.com`), then an IAM role whose trust
policy uses `sts:AssumeRoleWithWebIdentity` with a **`StringEquals`** condition on the exact `sub`:
```json
"Condition": { "StringEquals": {
  "token.actions.githubusercontent.com:sub": "repo:org/repo:ref:refs/heads/main" } }
```
The condition is **mandatory** -- without it any repo can assume the role. Use `StringEquals` on an
exact `sub`, never a trailing-wildcard `StringLike` (which allows any branch/PR/tag). Attach a
least-privilege deploy policy (S3 sync + CloudFront invalidation).

**Workflow** (see [templates/github-actions-oidc-deploy.yml](../templates/github-actions-oidc-deploy.yml)):
set `permissions: { id-token: write, contents: read }` (required or the credentials step fails), use
`aws-actions/configure-aws-credentials@v4` with `role-to-assume` (no keys), build, `aws s3 sync`
(hashed assets immutable, `index.html` short TTL), then `create-invalidation --paths "/*"` (forgetting
it serves stale cache). Scope the trust to a GitHub Environment for a required-reviewer approval gate.
Access keys remain only a fallback when OIDC is disallowed -- treat them as long-lived secrets, scope
and rotate tightly.
