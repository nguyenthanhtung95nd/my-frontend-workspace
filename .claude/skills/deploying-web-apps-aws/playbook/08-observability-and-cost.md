# 08 - Observability and cost

Once a frontend depends on Lambda + API Gateway + DynamoDB, "works on my machine" is not a plan. You
need a record of what happened and whether it is getting worse -- and a guard against surprise bills.

## CloudWatch: logs, metrics, alarms
Three pillars, published automatically (no agent): **logs** (log groups/streams), **metrics**
(numeric time-series per namespace: `AWS/Lambda`, `AWS/ApiGateway`, `AWS/DynamoDB`), **alarms** (watch
one metric, act on a threshold -> SNS).

**Structured logging:** log JSON, not strings, so fields become queryable in Logs Insights.
```ts
console.log(JSON.stringify({ level: 'info', message: 'request', requestId, route, durationMs }));
```
Set retention explicitly -- **log groups default to never expire** (a quiet, growing cost):
```bash
aws logs put-retention-policy --log-group-name /aws/lambda/<fn> --retention-in-days 30
```
Codify retention in IaC (e.g. CDK `logRetention`) since a redeploy recreates infinite-retention
groups, and note that deleting a function does not delete its log group. Query with Logs Insights
(`fields | filter | stats | sort`).

**Metrics that matter:** Lambda `Invocations`/`Errors`/`Duration`/`Throttles`/`ConcurrentExecutions`;
API Gateway (dimension `ApiId`) `Count`/`4XXError`/`5XXError`/`Latency`/`IntegrationLatency`; DynamoDB
`Consumed*CapacityUnits`/`ThrottledRequests`. Graph error rate (`Errors/Invocations`) with Average +
**p95** latency (averages hide outliers). `Latency - IntegrationLatency` = gateway overhead.

## Alarms + SNS
```bash
TOPIC=$(aws sns create-topic --name alerts --query TopicArn --output text)
aws sns subscribe --topic-arn $TOPIC --protocol email --notification-endpoint you@example.com  # CONFIRM the emailed link
aws cloudwatch put-metric-alarm --alarm-name lambda-errors \
  --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=<fn> \
  --statistic Sum --period 300 --evaluation-periods 2 --threshold 3 \
  --comparison-operator GreaterThanThreshold --alarm-actions $TOPIC --ok-actions $TOPIC
```
An unconfirmed subscription delivers nothing silently. Starters: Errors Sum>3, Duration Avg>2000ms,
API `5XXError` Sum>0 (`--evaluation-periods 1` fires immediately), Throttles>0. New alarms sit in
`INSUFFICIENT_DATA` until the first evaluation; on low traffic add `--treat-missing-data notBreaching`.
Test the whole pipeline without real errors: `aws cloudwatch set-alarm-state --alarm-name <n>
--state-value ALARM --state-reason test`. A throwing handler still returns `StatusCode: 200` +
`FunctionError` -- alarm on the `Errors` metric, not invoke status.

## Tracing a single request
Observability (why did *this* request fail?) beyond monitoring (errors went up): put a correlation id
in every structured log line -- use `event.requestContext.requestId` -- then reconstruct a timeline
with `filter requestId = "..." | sort @timestamp asc`. Return the id to users for support lookups.
DynamoDB has no per-request logs (metrics only). Beyond manual: AWS X-Ray (auto-instrumentation),
CloudWatch Application Signals, ADOT (OpenTelemetry).

## Cost control
AWS bills exact usage; a forgotten resource runs up charges before you notice. Set a budget:
```bash
aws budgets create-budget --account-id <acct> --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json   # 80% + 100% email
```
Always-free tiers: Lambda (1M invocations, 400k GB-s), CloudFront (1 TB, 10M requests), DynamoDB
(25 GB, provisioned only), CloudWatch (5 GB logs, 10 metrics). Route 53 is **never free**
(~$0.50/zone/mo). Budget alerts lag hours -- they are not a kill switch. Quiet billers: hosted zones,
unretained logs, idle CloudFront, attached certs. Set log retention to 7-14 days on a learning stack.

## Teardown (reverse dependency order -- this is how you stop paying)
1. CloudFront (disable, wait `distribution-deployed`, delete) + OACs; 2. Route 53 records then zones;
3. ACM certs (detach first); 4. API Gateway + domains; 5. Lambda; 6. IAM roles (detach policies first);
7. DynamoDB; 8. SSM params / Secrets Manager; 9. CloudWatch log groups, alarms, SNS; 10. S3 (empty all
versions + delete markers, then delete); 11. budgets; 12. IAM users (delete access keys first). Wrong
order -> `ResourceInUseException`/`DependencyViolation`. Lambda@Edge replicas clear asynchronously
(deletion blocked for a while). Keep root/admin. Recheck the Billing dashboard days later.
