# syntax=docker/dockerfile:1.7

FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw
RUN --mount=type=cache,target=/root/.m2/wrapper \
    --mount=type=cache,target=/root/.m2/repository \
    ./mvnw -B -Dmaven.test.skip=true dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2/wrapper \
    --mount=type=cache,target=/root/.m2/repository \
    ./mvnw -B -Dmaven.test.skip=true clean package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
ENV SPRING_PROFILES_ACTIVE=docker
COPY --from=build /app/target/*.jar backend.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","backend.jar"]
