# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy the pom.xml and download dependencies
# This caches the dependencies layer unless pom.xml changes
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package the application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/api-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
