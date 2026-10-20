# ShopEasy security review — 2026-10-20

## Corrections

- Order detail reads verify the authenticated owner or ADMIN before returning data. Updates already checked ownership.
- Kafka's diagnostic publishing endpoint is ADMIN-only.
- Access JWTs and refresh JWTs have distinct `token_use` claims and cannot substitute for one another. Previously issued untyped tokens require login again.
- JWT sessions are stateless. CORS is limited to the configured frontend origin, required methods and headers; cookie credentials are not used.
- The Angular interceptor only sends bearer tokens to the configured API origin and `/api/` paths.
- Nested order item validation rejects non-positive quantities; orders have at most 50 lines. Product/order page sizes are limited to 100, with allowlisted order sort fields.
- Unexpected errors return a generic message. Authorization failures return 403.
- The public static site sends CSP frame-ancestors/object-src/base-uri restrictions, nosniff and a strict-origin referrer policy. These were configured in Render and verified on the public HTTP response. This is not a complete script-src CSP.
- Hosted Swagger/API docs are disabled; only actuator health remains public. Public ADMIN registration stays disabled on hosting.
- A bounded in-memory guard limits authentication POSTs to 60/minute per remote address per instance. It ignores spoofable forwarded headers. A proxy may group customers under one remote address, and restarts reset counters.
- Six clearly marked demo products use bundled original SVG illustrations. The hosted initializer inserts only missing demo names and never creates accounts or overwrites existing products.

## Validation and limits

Security tests cover token confusion, cross-customer order reads, Kafka authorization, negative order quantities, authentication limits and repeatable catalog insertion. Public smoke checks must also be repeated after deployment.

This is a targeted application review, not a penetration test or a guarantee that all vulnerabilities are eliminated. Refresh tokens remain in browser localStorage, are not single-use/revocable, and logout clears the browser rather than server-side revocation. A production store should use a deliberate HttpOnly-cookie/session design with CSRF protection, revocation/rotation, distributed rate limiting, backups and monitoring. Review transitive Java dependencies separately; no full Java vulnerability scan was completed here. Do not use real customer or payment information in this portfolio demonstration.

References:
- https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html
- https://docs.spring.io/spring-security/reference/6.5/servlet/authentication/session-management.html

Dependency validation: Angular framework aligned to 20.3.34 and tooling updated within Angular 20. The final npm production audit (`npm audit --omit=dev`) reported zero known vulnerabilities. The full development dependency tree still has nine high-severity advisories; resolving those requires a separately tested tooling migration. Production audit results do not cover Java dependencies or unknown vulnerabilities.

Local validation: 21 backend tests and 22 focused frontend tests passed; the hosting Angular production build was checked separately.
