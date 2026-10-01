# Docker & Containerization Guide

This document explains Docker, containerization, and our container architecture from zero for beginners.

---

## 1. What is Docker?
Docker is an open-source platform that automates the deployment of applications inside lightweight, portable, self-sufficient software containers.

## 2. Why are we using Docker in this project?
In professional software development, a common issue is *"it works on my machine but breaks in production."* Docker solves this by packaging the application code along with the exact operating system libraries, Python runtime, and configurations required, ensuring that the project runs identically across local development, testing servers, and AWS cloud instances.

## 3. Core Concepts

### What is an Image?
An **image** is a read-only blueprint or snapshot containing the application code, runtime libraries, and environment settings. Think of an image like an architectural floor plan or a frozen executable.

### What is a Container?
A **container** is a live, running instance of an image. If the image is the blueprint, the container is the physical house built from that blueprint. You can start, stop, restart, or delete containers in seconds.

### What is a Dockerfile?
A `Dockerfile` is a text file containing step-by-step instructions on how Docker should assemble an image.
* Example in our project: [`backend/Dockerfile`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/Dockerfile) starts from `python:3.11-slim`, installs our `requirements.txt`, copies our Python code, and declares the `uvicorn` startup command.

### What is Docker Compose?
Docker Compose is a tool for defining and running multi-container Docker applications. While `docker run` starts one container at a time, Docker Compose uses a single YAML file ([`docker-compose.yml`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/docker-compose.yml)) to configure and launch all application services together.

---

## 4. Multi-Service Architecture in Our Project

Our application is designed as three decoupled services communicating over an internal network:

```text
React Frontend (Port 3000)
       |
       | HTTP REST Requests
       v
FastAPI Backend (Port 8000)
       |
       | SQL Queries (Port 3306)
       v
MySQL Database (Container: db)
```

### What Each Container Does:
1. **`db` (MySQL 8.0)**:
   * Runs the MySQL database server.
   * Uses an isolated Docker volume (`mysql_data`) so data persists even if the container stops.
   * Includes a healthcheck probe (`mysqladmin ping`) to confirm it is ready before the backend starts.
2. **`backend` (FastAPI)**:
   * Built from [`backend/Dockerfile`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/Dockerfile).
   * Runs the REST API and the simulated automation engine.
   * Connects to MySQL using hostname `db` instead of `localhost`.
3. **`frontend` (React)**:
   * Serves the React Single Page Application on port 3000.
   * Sends user requests and authentication headers to the backend API.

---

## 5. Important Docker Commands

| Command | Purpose | Explanation |
| :--- | :--- | :--- |
| `docker compose up -d` | Starts all services in the background | `-d` means "detached" mode so your terminal remains free. |
| `docker compose down` | Stops and removes all containers and internal networks | Safely shuts down services without deleting persistent database volumes. |
| `docker compose build` | Rebuilds the container images | Run this when you have changed `requirements.txt` or a `Dockerfile`. |
| `docker compose ps` | Lists all running containers for this project | Shows container status, health, and port mappings. |
| `docker compose logs -f backend` | Streams live logs from the backend container | `-f` means "follow" (live stream). |

---

## 6. Implementation Status on This Machine

* **Configuration**: **CONFIGURED & CLOUD-READY** ([`docker-compose.yml`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/docker-compose.yml) and [`backend/Dockerfile`](file:///c:/Users/Gopi/OneDrive/Desktop/cloud-it-service-portal/backend/Dockerfile) are fully defined).
* **Local Machine Runtime**: **NOT INSTALLED**. The Docker CLI is not installed in the Windows host PATH.
* **Execution Strategy**: We run the application directly on native Python (`backend/venv`) and MySQL (`MySQL80` service), guaranteeing 100% functionality without pretending Docker was executed locally.
