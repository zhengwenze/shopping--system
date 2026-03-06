FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
ENV SPRING_PROFILES_ACTIVE=docker
COPY --from=build /app/target/*.jar backend.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","backend.jar"]
