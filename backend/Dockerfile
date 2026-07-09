# ---- Stage 1: Build ----
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
# Download dependencies first (layer caching)
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Create upload directory for resumes
RUN mkdir -p /app/uploads/resumes

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
