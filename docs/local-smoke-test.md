# Local backend smoke test

The optional launcher starts the real Spring Boot API on `127.0.0.1:8080`,
using the existing test profile with an in-memory H2 database and a real embedded
Kafka broker. It requires Java 21 and downloads Maven dependencies on first use.
It does not require Docker, MySQL or a separate Kafka installation.

From `backend/`:

```sh
./mvnw test-compile org.codehaus.mojo:exec-maven-plugin:3.5.0:java -Dexec.mainClass=com.shopeasy.ecommerce.LocalBackendApplication -Dexec.classpathScope=test
```

On Windows, use `mvnw.cmd`. From `frontend/`, run `npm ci` and `npm start`.
Open `http://127.0.0.1:4200` and create disposable test accounts and products.
Data is temporary and disappears when the backend process stops. The launcher
exists only in the test source set and is not included in the production jar.
The Kafka consumer is disabled by the existing test profile; order publication
uses the real producer and embedded broker.

## Validation performed on 2026-10-20

- API: ADMIN/USER registration and login; invalid login rejected; USER product
  creation forbidden; ADMIN product creation; name and price filtering;
  pagination; empty search and order history; persisted orders and item totals;
  order details; insufficient stock rejected.
- Browser: login at `127.0.0.1:4200`, product search and details, add two units of
  a product priced BRL 39.90, submit order, open history and confirm order details
  totaling BRL 79.80. Currency is displayed with Brazilian number formatting.
- Fixed a reproduced CORS failure at `127.0.0.1:4200`. The explicit allowlist now
  accepts this loopback alias as well as the existing localhost origins.
- Regression: `SecurityCorsTest` verifies allowed loopback origins and rejects an
  unlisted external origin. Seven targeted frontend catalog/navigation tests
  passed; the production frontend build passed.

This validates the real HTTP/JPA/authentication/order flow with H2. It does not
validate MySQL behavior, Docker orchestration, external Kafka consumers or a
production deployment.

## Refactoring regression checks

The catalog and order composer share the product-filter component and its filter model. Product creation, editing and the standalone form share a form factory. Order endpoints share their pagination/sort construction. Existing defaults, validators, request arguments, labels and routes are preserved.

Validation: 23 targeted frontend tests, 9 backend unit tests and the production frontend build passed. Browser checks covered search, clearing filters, cart submission and a persisted two-unit order totaling BRL 79.80. Stale product-form tests were aligned with the existing zero defaults and saved output event before refactoring.
