# ShopEasy security review — 2026-10-22

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

This is a targeted application review, not a penetration test or a guarantee that all vulnerabilities are eliminated. Refresh tokens remain in browser localStorage, are not single-use/revocable, and logout clears the browser rather than server-side revocation. A production store should use a deliberate HttpOnly-cookie/session design with CSRF protection, revocation/rotation, distributed rate limiting, backups and monitoring. The runtime Java dependency tree is audited with OSV in CI; see the reviewed applicability exceptions below. Do not use real customer or payment information in this portfolio demonstration.

References:
- https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html
- https://docs.spring.io/spring-security/reference/6.5/servlet/authentication/session-management.html

## Dependency validation

Angular framework/tooling migrated to 21.2.25/21.2.27, TypeScript 5.9 and Vitest 4.1.12. Karma/Jasmine and unused Angular packages were removed. Vite and MCP SDK overrides select compatible patched releases. The complete npm audit, including development dependencies, reports zero known advisories on 2026-10-22.

Spring Boot is 3.5.16, JJWT 0.12.7 and springdoc 2.8.17. Patched overrides select Tomcat 10.1.61, Jackson 2.21.8, Log4j 2.25.5, commons-lang3 3.18.0 and lz4-java 1.12.1. All 36 backend tests pass with these versions.

OSV inspected 100 compile/runtime packages. Two Spring MVC advisories remain in the dependency version, but their required features are absent from this JSON REST API:

- [CVE-2026-47890](https://spring.io/security/cve-2026-47890/), GHSA-j9f9-w8pj-32f8: requires SSE view fragments; no SSE or server-rendered views exist here.
- [CVE-2026-47884](https://spring.io/security/cve-2026-47884/), GHSA-pc63-qcmh-9cmg: requires XsltView with implicit view rendering; there are no XSLT views or view controllers.

These are applicability exceptions, not dependency fixes. `security/osv-exceptions.json` limits them to the exact package/version and expires on 2026-11-21. CI fails for new/unreviewed advisories, expired exceptions or source symbols indicating these features. The scan is not a substitute for code review. An eventual Spring Boot 4 migration should remove the exceptions after full compatibility testing.

## First-visit behavior

Anonymous catalog navigation retains authentication and shows an inline explanation at login. The original unspecified warning could not be reproduced conclusively. An additional stale-session edge case was corrected: legacy, wrong-purpose, expired and malformed stored access tokens clear the session instead of opening the catalog with an invalid session. Regression tests cover malformed/legacy tokens and admin roles after refresh.

The hosted database enforces primary keys. Order and item IDs now use a keyed TABLE generator rather than keyless implicit sequence tables. The hosted initializer advances the counters to preserve existing IDs; the database protection remains enabled. Local order persistence tests passed.

Public verification passed 13 checks: six catalog products and their SVG assets, separate access/refresh token validation, valid refresh, customer denial on product creation/Kafka publishing, negative quantities, excessive pagination, creation of demo order 2, owner access, cross-customer denial and blocked public ADMIN registration. Render logs confirmed receipt of order 2 in Kafka. Static-site security response headers were also verified. No personal accounts were used for these tests.
