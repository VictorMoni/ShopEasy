#!/bin/sh
set -eu
if [ -n "${AIVEN_CA_CERT:-}" ]; then
  printf '%s\n' "$AIVEN_CA_CERT" > /tmp/aiven-ca.pem
  cp "$JAVA_HOME/lib/security/cacerts" /tmp/shopeasy-truststore
  keytool -importcert -noprompt -alias aiven -file /tmp/aiven-ca.pem -keystore /tmp/shopeasy-truststore -storepass changeit
  exec java -Djavax.net.ssl.trustStore=/tmp/shopeasy-truststore -Djavax.net.ssl.trustStorePassword=changeit -jar /app/app.jar
fi
exec java -jar /app/app.jar
