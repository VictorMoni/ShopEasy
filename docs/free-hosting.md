# Free hosting: Render + Aiven

Use one Render Free web service for the Spring Boot API, a free Render Static Site
for Angular, and Aiven Free MySQL and Kafka services. Select Free explicitly;
Aiven trial credits and Render paid defaults are separate from these plans.

## Backend

Deploy the repository branch containing these changes, with root directory
`backend`, Dockerfile `./Dockerfile`, plan Free, health path
`/actuator/health` and environment variables from `render.yaml`.

- `SPRING_PROFILES_ACTIVE=hosting`
- `MYSQL_JDBC_URL=jdbc:mysql://HOST:PORT/defaultdb?sslMode=VERIFY_IDENTITY&serverTimezone=UTC`
- `MYSQL_USERNAME`, `MYSQL_PASSWORD`: MySQL service credentials.
- `KAFKA_BOOTSTRAP_SERVERS`: SASL host:port from Aiven.
- `KAFKA_SASL_JAAS_CONFIG`: `org.apache.kafka.common.security.scram.ScramLoginModule required username="USER" password="PASSWORD";`
- `AIVEN_CA_CERT`: project CA PEM certificate, with real line breaks.
- `JWT_SECRET`: generated random secret (at least 32 bytes).
- `FRONTEND_URL`: exact HTTPS origin of the Angular site, without trailing slash.

Create the Kafka topic `order-events` on the free Kafka service. The Docker
entrypoint trusts the project CA for MySQL hostname validation and Kafka TLS.
The hosting profile limits connection pools and JVM memory and only exposes the
health actuator endpoint. Public registration cannot create ADMIN users in this
profile. Administrator access must be provisioned separately by the project owner.
No credentials belong in Git or frontend variables.

## Frontend

Create a Render Static Site from the same branch, root `frontend`, build command
`npm ci && npm run build:hosting`, publish directory `dist/frontend/browser`.
Set `SHOP_API_URL` to the backend HTTPS origin and Node version 22. Add a rewrite
from `/*` to `/index.html` so direct links work. Rebuild after changing the API URL.

Render Free can sleep after 15 minutes without requests and uses monthly quotas.
Aiven Free services may pause when inactive. This setup is for a portfolio demo,
not a production store with uptime or durability guarantees.

Sources: https://render.com/docs/free and https://aiven.io/free-tier
