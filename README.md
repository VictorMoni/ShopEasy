![ShopEasy — project cover](.github/project-cover-dark.svg)

# ShopEasy

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_ShopEasy-10B981?style=for-the-badge)](https://shopeasy-vm.onrender.com)

This repository contains a simple **E-commerce Application**, composed of:

- **Frontend**: SPA in **Angular 20**, packaged and served by **NGINX**.
- **Backend**: RESTful API in **Spring Boot 3.5.0** (Java 21).
- **Database**: **MySQL 8.0**.
- **Messaging**: **Apache Kafka** for order events.
- **Infrastructure**: **Docker Compose** for local orchestration and **Kubernetes (K8s)** for deployment in cloud or local clusters.

---

## 📚 Table of Contents

1. [Overview](#-overview)
2. [Technologies Used](#️-technologies-used)
3. [Folder Structure](#-folder-structure)
4. [Push Images to DockerHub](#-push-images-to-dockerhub)
5. [Run with Docker Compose](#️-run-with-docker-compose)
6. [Run with Kubernetes](#-run-with-kubernetes)
7. [Tests](#-tests)
8. [Final Considerations](#-final-considerations)

---

## 💡 Overview

The project aims to provide a complete foundation for an e-commerce system with:

- JWT Authentication
- CRUD for users, products, and orders
- Kafka events for order processing
- Observability via Spring Actuator
- Local deployment with Docker Compose or in cluster with Kubernetes

---

## ⚙️ Technologies Used

### Backend

- Java 21
- Spring Boot 3.5.0
- Spring Security
- Spring Data JPA
- Apache Kafka
- MySQL
- JUnit 5 and Mockito (tests)

### Frontend

- Angular 20
- RxJS
- Karma / Jasmine
- JWT

### Infrastructure

- Docker
- Docker Compose
- Kubernetes (Minikube)
- ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 📂 Folder Structure

```
ShopEasy/
├── backend/
|   |── src/
│   ├── pom.xml
│   └── Dockerfile
├── elk                 # Logstash configuration
├── frontend/
|   ├── src/
│   ├── package.json
│   └── Dockerfile
├── k8s/
├── .gitignore
├── docker-compose.yml  # Kubernetes manifests
├── LICENSE             # MIT LICENSE
├── minikube.sh         # Script to run minikube
└── README.md
```

---

## 🐋 Push Images to DockerHub

### Log in to Docker Hub

First, authenticate in the terminal:

```bash
docker login
```

### Build the images

In the frontend directory:

```bash
docker build -t your-username/shopeasy-frontend:latest .
```

In the backend directory:

```bash
docker build -t your-username/shopeasy-backend:latest .
```

### Push to Docker Hub

After logging in and building the images:

```bash
docker push your-username/shopeasy-frontend:latest
docker push your-username/shopeasy-backend:latest
```

---

## 🛠️ Run with Docker Compose

### Clone the repository:

```bash
git clone https://github.com/victormoni/ShopEasy.git
cd ShopEasy
```

### Run npm install in the frontend folder:

```bash
cd frontend
npm i
```

### Start all services in detached mode and build:

```bash
docker compose up -d --build
```

### Access the application:

- Frontend: [http://localhost](http://localhost)
- Actuator: [http://localhost:8080/actuator](http://localhost:8080/actuator)
- Swagger: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- Kafka UI: [http://localhost:8085/](http://localhost:8085/)
- Kibana: [http://localhost:5601/](http://localhost:5601/)
- H2 Database: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- MySQL: [localhost:3306](localhost:3306)

### Stopping the Containers

```bash
docker compose down
```

---

## 🚀 Run with Kubernetes

### Open the project with VSCode as Administrator

Download VSCode and right-click to open it as administrator, then open the project folder.

[VSCode Download](https://code.visualstudio.com/download)

### Start infrastructure

Run the minikube.sh script selecting the type of driver you want to use (HyperV or Docker):

```bash
./minikube.sh hyperv
```
or

```bash
./minikube.sh docker
```

### Run minikube tunnel

Run the minikube tunnel command in another terminal as administrator for the store to work, keep the tunnel open while using it.

```bash
minikube tunnel
```

### Get the EXTERNAL-IP of the Ingress NGINX with the command below:

```bash
kubectl get svc -n ingress-nginx

echo "NAME                                 TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)                      AGE"
echo "ingress-nginx-controller             LoadBalancer   10.109.168.86   192.168.49.2    80:31945/TCP,443:31383/TCP   5m"
```

### Then access in the browser: http://EXTERNAL-IP/"

Take the EXTERNAL-IP from the previous command and replace "localhost" in the URLs you want to use, remember that depending on the URL you may need to include the port:

- Example:

[http://192.168.49.2:5601](http://192.168.49.2:5601)

---

## 🔧 Tests

### Backend

- Backend tests with JUnit 5 + Mockito
- Integration tests with H2 database
- Using Jacoco for Code Coverage

```bash
mvn clean verify
```

### Frontend:

- Frontend tests with Karma + Jasmine

```bash
ng test
```

---

Thank you for using **ShopEasy**!
If you have any questions or suggestions, open an [issue](https://github.com/victormoni/ShopEasy/issues) or submit a Pull Request.

**Author:** Victor Moni  
**License:** MIT License (see the [LICENSE](LICENSE) file for more details)

## Local backend validation

See [the local smoke-test guide](docs/local-smoke-test.md) for the disposable backend launcher and validation results.
