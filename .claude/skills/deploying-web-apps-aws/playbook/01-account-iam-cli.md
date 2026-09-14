# 01 - Account, IAM and CLI

## Secure the account first
- Root is unlimited and billable -- put MFA on it, **never create root access keys**, and use it only
  as break-glass. Do everyday work as an IAM admin user (in an `Administrators` group with the managed
  `AdministratorAccess` policy), also MFA-protected.
- Enable a CloudTrail trail to S3 (default event history is only 90 days), and enable IAM access to
  Billing. Production preference: IAM Identity Center (SSO), no long-lived keys.

## IAM mental model
Four pieces: **Users** (a person/app with credentials), **Groups** (permission containers, no
credentials), **Roles** (no permanent credentials -- assumed for short-lived ones; how services and
CI authenticate), **Policies** (JSON rules; an identity has zero permissions without one). Evaluation
order: default deny -> an explicit **Deny** wins immediately -> else an explicit **Allow** -> else
implicit deny. Adding an Allow never overrides a Deny -- check Deny statements first when debugging.

## Write a least-privilege policy
The five fields: `Version` (always `"2012-10-17"` -- omitting it silently falls back to 2008),
`Effect` (`Allow`/`Deny`), `Action` (`service:Operation`), `Resource` (ARN), and optional `Sid`/`Condition`.

The load-bearing trick is **bucket ARN vs object ARN**:
```json
{ "Version": "2012-10-17", "Statement": [
  { "Sid": "List",   "Effect": "Allow", "Action": "s3:ListBucket",
    "Resource": "arn:aws:s3:::assets-bucket" },
  { "Sid": "Write",  "Effect": "Allow", "Action": ["s3:PutObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::assets-bucket/*" },
  { "Sid": "Cache",  "Effect": "Allow", "Action": "cloudfront:CreateInvalidation",
    "Resource": "arn:aws:cloudfront::123456789012:distribution/EXAMPLEID" } ] }
```
- `s3:ListBucket` targets the **bucket** ARN (no `/*`); object actions target the **object** ARN
  (`/*`). Mixing these up is the #1 "my policy doesn't work" cause.
- `s3:DeleteObject` + `s3:ListBucket` are exactly what `aws s3 sync --delete` needs.
- CloudFront ARNs have an **empty region** segment (global service).
- Never `s3:*` / `Resource: "*"`. Workflow: list the commands -> map to actions -> scope to exact ARNs
  -> test -> add denied actions one at a time. Verify by running a forbidden call and confirming
  `AccessDenied`. Use CloudTrail + IAM Access Analyzer (`create-analyzer --type ACCOUNT_UNUSED_ACCESS`)
  to find over-grants.

## AWS CLI
Install v2 only. `aws configure` writes `~/.aws/credentials` (keys) and `~/.aws/config` (region,
output); note the asymmetry -- `[personal]` in credentials but `[profile personal]` in config. Verify
identity with `aws sts get-caller-identity` (the `whoami`, needs no permissions). High-level `aws s3`
ignores `--output json`; use `aws s3api` for scriptable output. Never commit `~/.aws/`; rotate/delete
unused keys. Production: `aws configure sso`.

## Infrastructure as code
Console clicks do not reproduce, audit, or recover. All IaC compiles to CloudFormation:
- **CloudFormation** -- native YAML/JSON, verbose.
- **CDK v2** (`aws-cdk-lib` + `constructs`) -- real TypeScript; ~45 lines can define bucket +
  CloudFront (OAC) + HTTPS + SPA errors + Route 53 alias. L2 constructs carry safe defaults; L1 map
  1:1. Deploy with `npx cdk deploy`. (CDK v1 is end-of-life.)
- **SST** -- opinionated serverless framework on CDK.

Adopt IaC once a stack stabilizes; it faithfully encodes bad decisions too, so understand the services
first. This repo's Taskly project is a CDK-first worked example.
