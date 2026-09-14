# 05 - Lambda

Event-driven serverless compute. Lifecycle: **Init** (download package, start runtime, run top-level
code -- billed) -> **Invoke** (handler per request) -> **Shutdown** (after idle). It is stateless
(no durable local state; warm reuse is not guaranteed). Limits: 15-min timeout, 128 MB-10,240 MB
memory, 50 MB zipped / 250 MB unzipped, 10 GB `/tmp`. Free tier: 1M invocations/month.

## Handler
```ts
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  const method = event.requestContext.http.method;      // NOT event.httpMethod (that is v1.0)
  const body = event.body ? JSON.parse(event.body) : {}; // event.body is always a string
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ok: true }) };         // must stringify, or you get [object Object]
};
```
Use `async` (not callbacks). Retry semantics differ: sync (API Gateway) does not retry; async
(S3/SNS/EventBridge) retries twice then a DLQ; stream sources retry until the record ages out.
`crypto.randomUUID()` is native in Node.

## Package and deploy
Bundle with esbuild and externalize the SDK (it ships in the runtime) -- this can shrink a package
from ~37 MB to a few KB:
```bash
esbuild handler.ts --bundle --platform=node --target=node22 --outfile=dist/handler.js --external:@aws-sdk/*
cd dist && zip -r ../function.zip .        # zip from INSIDE dist/, so handler.js is at the zip root
aws lambda create-function --runtime nodejs22.x --architectures arm64 \
  --handler handler.handler --role <role-arn> --zip-file fileb://function.zip
aws lambda invoke --function-name <fn> --cli-binary-format raw-in-base64-out \
  --payload file://event.json response.json
```
`--handler` is `<file>.<export>`; zipping the folder (not its contents) causes `Runtime.HandlerNotFound`.
Use `fileb://` for the binary zip, `file://` for a text payload. Tail logs with
`aws logs tail /aws/lambda/<fn> --follow`. If you bundle your own dependencies for a determinstic SDK
version, copy `node_modules` into `dist/` before zipping (the runtime pins a region-varying SDK minor).

## Cold starts
The first request after idle pays Init. Mitigate: keep the bundle small; **initialize SDK clients
outside the handler** so warm invocations reuse them; increase memory (128 -> 512/1024 MB cuts cold
start 40-60%, and CPU scales with memory); prefer `arm64` (~20% cheaper); `await import()` rarely-used
heavy deps lazily. Avoid VPC unless required (+1-2s). `Init Duration` appears in the REPORT line only
on a cold start. Provisioned concurrency removes cold starts but bills like an always-on server and
needs a published version.

## Environment variables (config, not secrets)
```bash
aws lambda update-function-configuration --function-name <fn> \
  --environment 'Variables={TABLE_NAME=my-table,STAGE=production}'
```
`--environment` **replaces** all variables (re-specify every one). Read at top level; `process.env.X`
is `string | undefined` -- guard it. 4 KB total limit. **Never store secrets** -- env vars are
plaintext, visible to anyone with `lambda:GetFunctionConfiguration`.

## Execution role
The role is the single most important per-function security decision. Trust policy (who can assume)
allows the Lambda service; permission policies (what it can do) are least-privilege:
```json
{ "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }
```
Attach the managed `AWSLambdaBasicExecutionRole` for logging, plus scoped custom policies per service
(e.g. `s3:GetObject` on one bucket ARN). Never attach `AdministratorAccess`. IAM propagation is
eventual -- "role cannot be assumed by Lambda" right after creation just means wait ~10-15s and retry.

## Reading secrets at runtime
Fetch once at init, cache in a module-level variable, reuse across warm invocations:
```ts
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
const ssm = new SSMClient({});                            // module scope
let apiKey: string | undefined;
async function loadConfig() {
  if (apiKey) return;                                     // one lookup per warm env
  const r = await ssm.send(new GetParameterCommand({ Name: '/app/prod/api-key', WithDecryption: true }));
  apiKey = r.Parameter?.Value;
}
```
For a SecureString, the role needs **two** statements: `ssm:GetParameter` on the parameter ARN **and**
`kms:Decrypt` on `arn:aws:kms:...:alias/aws/ssm` -- decryption fails silently without the KMS grant.
Give the function a longer timeout (`--timeout 10`) so a cold-start secret fetch fits. See
[07-dynamodb-and-secrets.md](07-dynamodb-and-secrets.md) for Parameter Store vs Secrets Manager.
