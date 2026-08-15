# Frontend Security (Next.js / Firebase)

**AI defaults are rarely secure.** v0/AI puts checks on the client, grants permissive
rules, and forgets headers — because you didn't forbid it. Security only appears when you
ask for it explicitly, so bake it into the prompt and verify server-side.

## The one rule: enforce sensitive logic on the server

Client-side checks are for **UX only** (hiding a button). They are never the security
boundary. Every privileged read/write is verified again on the server.

- **Auth/RBAC** enforced in server route handlers / server actions, and in datastore
  security rules — not in the component.
- **Middleware (Edge):** lightweight gating only (session-cookie presence, or Edge-safe
  JWT via `jose` + JWKS). Do full role verification in Node route handlers. Never import
  `firebase-admin` in middleware.
- **Hide admin UI** unless the server confirms the role — but still enforce on the server.

## RBAC prompt checklist

When prompting for anything role-gated, require all of:

- [ ] Roles named and described (`admin`, `manager`, `user`, `guest`).
- [ ] Server-side enforcement requested (route handlers **and** datastore rules).
- [ ] Middleware responsibility clear (Edge-safe gating vs full verification).
- [ ] Datastore rules reference the role claim (`request.auth.token.role`), **default deny**.
- [ ] Admin-only UI hidden unless the server confirms.
- [ ] Loading / forbidden (403) / error states implemented.
- [ ] "Do not" guardrails included (below).

## "Do not" guardrails (put these in the prompt)

- Do **not** rely on client-only checks for protected actions.
- Do **not** grant public read/write rules (`allow read, write: if true`, or "any signed-in
  user can write any document").
- Do **not** import `firebase-admin` in middleware (Edge runtime).
- Do **not** hardcode secrets/keys — read from `.env.local`; keep server secrets off
  `NEXT_PUBLIC_*`.
- Do **not** disable safety checks (`ignoreBuildErrors`, ESLint off) to ship faster.

## Other hardening

- Sanitize and validate all user input; never `dangerouslySetInnerHTML` with unsanitized
  content.
- Security headers (CSP, HSTS, X-Frame-Options) configured, not left as scaffold "Check".
- No PII in client logs or error messages; sanitize error responses (no stack traces).
- File uploads: restrict type and size; validate server-side.
