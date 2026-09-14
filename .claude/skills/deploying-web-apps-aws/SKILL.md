---
name: deploying-web-apps-aws
description: Deploys a web application (static frontend + serverless backend) to AWS the right way -- S3, CloudFront, Route 53/ACM, Lambda, API Gateway, DynamoDB, secrets, monitoring, and CI/CD. Use when hosting a site/SPA on S3+CloudFront, wiring a Lambda/API Gateway/DynamoDB backend, setting up a custom domain + HTTPS, adding CloudWatch alarms or budgets, writing IAM policies, or building a GitHub Actions deploy pipeline.
---

# Deploying Web Apps on AWS

Ship a web app on AWS without the two classic failures: an over-permissioned/public setup, and a
surprise bill. Every step follows three rules -- **least privilege**, **infrastructure as code where
it pays**, and **know the cost/reversibility before you run it**.

## Enterprise + safety note
Deploying to AWS creates real, billable resources and needs credentials, roles, and a real account.
Use org/IT-approved accounts and roles; prefer an enterprise-managed path (IAM Identity Center, an
approved CI role) over personal long-lived keys. This skill never asks you to bypass an approval.

## Step 0 -- Detect, then pick a mode
Inspect: is this a static site, a serverless API, or both? What already exists (bucket, distribution,
domain, functions)? Is deployment manual (CLI) or IaC (CDK/CloudFormation)? Which region, and is a
custom domain + cert involved (remember: CloudFront certs live in **us-east-1**)?

- **Bootstrap** -- stand up a new deploy in dependency order (see the journey below).
- **Audit** -- score an existing deploy against [CHECKLIST.md](CHECKLIST.md) (security + cost + correctness).

## The deploy journey (build in dependency order)
1. **Account, IAM & CLI** -- secure the account, model IAM, write least-privilege policies, set up the CLI/IaC. See [playbook/01-account-iam-cli.md](playbook/01-account-iam-cli.md).
2. **S3 static hosting** -- private bucket, secure defaults, sync/versioning. See [playbook/02-s3-static-hosting.md](playbook/02-s3-static-hosting.md).
3. **CloudFront (CDN)** -- distribution + OAC, cache/invalidations, security headers, SPA routing, deploy script. See [playbook/03-cloudfront-cdn.md](playbook/03-cloudfront-cdn.md).
4. **DNS & TLS** -- Route 53 alias records, ACM certs (us-east-1), DNS validation, wildcards. See [playbook/04-dns-and-tls.md](playbook/04-dns-and-tls.md).
5. **Lambda** -- handler, packaging/deploy, cold starts, roles, secrets. See [playbook/05-lambda.md](playbook/05-lambda.md).
6. **API Gateway** -- HTTP vs REST, integration + invoke permission, CORS, stages, JWT auth. See [playbook/06-api-gateway.md](playbook/06-api-gateway.md).
7. **DynamoDB & secrets** -- key design, CRUD, Query vs Scan, Parameter Store vs Secrets Manager. See [playbook/07-dynamodb-and-secrets.md](playbook/07-dynamodb-and-secrets.md).
8. **Observability & cost** -- CloudWatch logs/metrics/alarms, tracing, budgets, and teardown. See [playbook/08-observability-and-cost.md](playbook/08-observability-and-cost.md).
9. **Edge & CI/CD** -- CloudFront Functions vs Lambda@Edge, and a keyless GitHub Actions pipeline. See [playbook/09-edge-and-cicd.md](playbook/09-edge-and-cicd.md).

## Cost/Risk policy (label every action)
- **free-tier** -- safe to run freely (IAM, most config, generous CloudFront/Lambda/DynamoDB tiers).
- **cost-incurring** -- bills per use; set budgets and log retention.
- **hard-to-reverse** -- domain registration, versioning-enable, deletes, DNS TTL, us-east-1 cert
  region. Confirm before running.
Always finish with **teardown in reverse dependency order** to stop charges -- idle CloudFront,
Route 53 zones, and unretained logs bill quietly.

## Golden rules
- Least privilege everywhere: specific actions on a **single resource ARN**, never `service:*` on `*`.
- Prefer **OIDC role assumption** in CI over long-lived access keys; scope the trust policy to one repo/branch.
- Prefer **IaC (CDK)** once a stack stabilizes -- reproducible, auditable, atomic teardown.
- CloudFront serves a **private** bucket via **OAC**; the S3 REST endpoint should return 403 directly.

For a CDK-first serverless reference implementation of this stack, see the Taskly project
(`taskly/` + `docs/learn-cdk.md`).

Templates: [templates/deploy.sh](templates/deploy.sh), [templates/iam-least-privilege-policy.json](templates/iam-least-privilege-policy.json), [templates/github-actions-oidc-deploy.yml](templates/github-actions-oidc-deploy.yml).
