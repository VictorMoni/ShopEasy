FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

COPY --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60.0 -XX:InitialRAMPercentage=15.0 -Xss512k"
USER 10001

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]