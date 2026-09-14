# 06 - API Gateway

## HTTP API vs REST API
Default to **HTTP APIs** (v2): ~$1.00/M requests, lower latency, auto-deploy `$default` stage,
built-in CORS, native JWT authorizers, simple `METHOD /path` proxy routing. Reach for **REST APIs**
(v1, ~$3.50/M) only for a feature they add -- API keys/usage plans, request/body validation, response
caching, WAF, resource policies, or VTL transformation. The handler code is portable; only the gateway
config differs (`apigatewayv2` vs `apigateway` CLI -- do not mix them).

## Create and wire to Lambda (3 steps)
```bash
API_ID=$(aws apigatewayv2 create-api --name my-api --protocol-type HTTP --query ApiId --output text)
INT=$(aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY \
  --integration-uri <lambda-arn> --payload-format-version 2.0 --query IntegrationId --output text)
aws apigatewayv2 create-route --api-id $API_ID --route-key "GET /items" --target "integrations/$INT"
aws lambda add-permission --function-name <fn> --statement-id apigw-get \
  --action lambda:InvokeFunction --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:<region>:<acct>:$API_ID/*"
```
- Omitting the `integrations/` prefix in `--target` -> 500. **Missing the invoke permission -> 500**
  (`{"message":"Internal Server Error"}`); a missing route -> 404 (`{"message":"Not Found"}`).
- Multiple routes can share one integration; the handler routes on
  `event.requestContext.http.method` or, more cleanly, `event.routeKey` (e.g. `'GET /items/{id}'`).
  Match the more specific route before the generic one. Path params: `event.pathParameters?.id`.
- The `$default` stage auto-deploys with no URL prefix. A Lambda Function URL is a no-cost alternative
  for a single endpoint (no routing/auth/stages).

## Request/response mapping
The event is `APIGatewayProxyEventV2`. Method/path live under `event.requestContext.http.*` (not
top-level). `queryStringParameters`/`pathParameters` are `undefined` when absent -- use optional
chaining. `event.body` is always a string (`JSON.parse` in a `try/catch`). Return `statusCode` (int) +
`body` (string, `JSON.stringify`); returning an object body yields `[object Object]`.

## CORS (once, on the API)
HTTP APIs auto-answer the preflight `OPTIONS` -- configure CORS on the API itself, not in the handler:
```bash
aws apigatewayv2 update-api --api-id $API_ID --cors-configuration \
  '{"AllowOrigins":["http://localhost:5173","https://example.com"],
    "AllowMethods":["GET","POST","PUT","DELETE"],
    "AllowHeaders":["Content-Type","Authorization"],"MaxAge":86400}'
```
List every dev + prod origin exactly (scheme+host+port; a trailing slash or missing port fails the
match). `AllowCredentials: true` cannot combine with `AllowOrigins: "*"`. Include any custom header
(e.g. `x-user-id`) or the browser preflight blocks it.

## Stages and custom domains
`$default` = auto-deploy, no prefix. Named stages need a `create-deployment` (or `--auto-deploy`) and
add a `/stage` URL prefix (stripped before the handler). A custom domain needs an ACM cert in the
**same region as the API** (unlike CloudFront's us-east-1), then `create-domain-name` +
`create-api-mapping`, then a Route 53 alias to the API Gateway domain. Set conservative
`ThrottlingBurstLimit`/`ThrottlingRateLimit` -- the shared account default (5,000 burst / 10,000 RPS)
can run up a bill.

## Authentication
Protect routes with a native JWT authorizer (validates signature/expiry/issuer/audience via the
provider's JWKS -- Cognito, Auth0, Okta, any OIDC):
```bash
aws apigatewayv2 create-authorizer --api-id $API_ID --authorizer-type JWT \
  --name jwt --identity-source '$request.header.Authorization' \
  --jwt-configuration Issuer=<issuer-url>,Audience=<audience>
aws apigatewayv2 update-route --api-id $API_ID --route-id <id> \
  --authorization-type JWT --authorizer-id <auth-id>
```
Claims arrive at `event.requestContext.authorizer.jwt.claims` (`sub` = user id -- read identity from
there, never a query param). A Lambda authorizer (`--authorizer-type REQUEST`) handles custom logic;
cache it with `--authorizer-result-ttl-in-seconds`. Common 401 causes: Cognito `aud` is the app client
id (not the pool id); Auth0 issuers need a trailing slash, Cognito does not. Routes without an
authorizer are open by default.
