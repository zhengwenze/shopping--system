FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/backend.jar backend.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "backend.jar"]
