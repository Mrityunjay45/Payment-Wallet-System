
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY . .

# Retry transient Maven repository failures
RUN mvn -B -ntp -Dmaven.wagon.http.retryHandler.count=5 clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
