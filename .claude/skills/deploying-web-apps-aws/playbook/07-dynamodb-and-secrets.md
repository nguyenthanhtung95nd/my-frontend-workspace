# 07 - DynamoDB and secrets

## DynamoDB: design around access patterns
A fully managed NoSQL key-value store that matches the serverless model (no connection pools,
per-request pricing). Only the primary key is mandatory; non-key attributes are schemaless. There are
no joins or ad-hoc SQL -- design keys from your access patterns first.

- **Simple key** = partition (HASH) only. **Composite key** = partition + sort (RANGE), which enables
  range queries within a partition.
- Partition keys need high cardinality and even distribution (`userId`/UUID good; `status`/`date` bad
  -> hot partition). The primary key is **immutable** after creation (hard-to-reverse) -- add a GSI
  for other access patterns.
```bash
aws dynamodb create-table --table-name my-table \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=itemId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=itemId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
aws dynamodb wait table-exists --table-name my-table
```

## CRUD with the Document Client
```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));   // module scope -> warm reuse
```
`PutCommand` creates/**replaces the whole item** (use `UpdateCommand` for partial updates or you lose
fields). `GetCommand` needs the full key and returns `undefined` when absent (not an error).
`UpdateCommand` uses `ExpressionAttributeNames` for reserved words (~500 of them, including `status`,
`name`, `data`, `type`) with `ReturnValues: 'ALL_NEW'`. `ConditionExpression` gives optimistic locking
and `attribute_not_exists` guards. `ConsistentRead` costs 2x RCUs.

## Query, not Scan
`Query` reads one partition and stays fast; `Scan` reads the whole table and gets slower/costlier as
data grows -- a Scan in an application endpoint is a code smell (usually the wrong key design).
```ts
await ddb.send(new QueryCommand({ TableName, KeyConditionExpression: 'userId = :u',
  ExpressionAttributeValues: { ':u': userId }, ScanIndexForward: false, Limit: 20 }));
```
The partition key must use `=`; the sort key supports `=`, `<`, `>`, `BETWEEN`, `begins_with`. A
`FilterExpression` trims the response but **still charges for every item read**. Both cap at 1 MB per
request -- paginate with `LastEvaluatedKey` -> `ExclusiveStartKey` (pass a base64 cursor to the client).

## Connect to Lambda
The execution role needs a least-privilege policy scoped to the **single table ARN** (else
`AccessDeniedException`):
```json
{ "Effect": "Allow", "Action": ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:UpdateItem",
  "dynamodb:DeleteItem","dynamodb:Query"], "Resource": "arn:aws:dynamodb:<region>:<acct>:table/my-table" }
```
Never `dynamodb:*` on `*`. Adding a new operation (e.g. PATCH) requires **both** a code change and the
matching IAM action. Bundle the SDK yourself for a deterministic version (the runtime pins a
region-varying minor).

## Secrets and configuration
Non-sensitive config (table names, stage, flags) can live in Lambda env vars. Sensitive values must
not -- env vars are plaintext, readable via `GetFunctionConfiguration`, and leak into console/CLI/CI
output with no rotation or audit. Decision rule:

| Need | Store |
|------|-------|
| Not sensitive | Parameter Store `String` (free) |
| Sensitive, no rotation | Parameter Store `SecureString` (KMS, free) |
| Sensitive + auto-rotation / RDS creds / compliance | Secrets Manager ($0.40/secret/mo + $0.05/10k calls) |

**Parameter Store** supports a hierarchy (`/app/prod/api-key`) so you can scope IAM to a subtree
(`/app/prod/*`) and load a whole env in one `get-parameters-by-path --recursive` call (which caps at
10 per call -- paginate on `NextToken`). SecureString reads need `--with-decryption` and a paired
`kms:Decrypt` grant. **Secrets Manager** adds automatic rotation via a Lambda (create -> `AWSPENDING`
-> test -> promote to `AWSCURRENT`, keeping `AWSPREVIOUS` for zero-downtime) and always KMS-encrypts;
store multi-value secrets as JSON, and cache with a TTL or a rotated secret breaks the cached copy.
Deletes have a 7-30 day recovery window (hard-to-reverse with `--force-delete-without-recovery`). The
common hybrid: static config + secrets in Parameter Store, rotating credentials in Secrets Manager,
read both at init with `Promise.all`.
