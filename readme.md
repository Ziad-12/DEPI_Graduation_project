# Containerized URL Shortener with Monitoring

A fully containerized URL shortener webservice built with Expressjs , SQLite, Prometheus, and Grafana. This project allows shortening URLs, redirecting users, tracking performance metrics, and visualizing service usage in real-time dashboards.

## Features

- Functional URL shortening and redirection
- Metrics tracking with Prometheus:
  - Total URLs shortened
  - Total redirects
  - 404 errors
  - Request latency
- Visualization dashboards in Grafana:
  - URL creation rate
  - Redirection rate
  - 95th percentile latency
  - Error monitoring
- Persistent storage using Docker volumes
- Alerts for high latency or high 404 errors
- Fully local setup with Docker Compose

## Technology Stack

- **Web Framework:**  Express (Node.js)
- **Database:** SQLite
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Monitoring:** Prometheus
- **Visualization & Alerts:** Grafana

## Architecture Overview

Client → URL Shortener → SQLite DBClient

│
└→ /metrics → Prometheus → Grafana

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

```bash
git clone https://github.com/Ziad-12/DEPI_Graduation_project.git
cd DEPI_Graduation_project
docker-compose up --build
```

This will start three containers:

* URL shortener service
* Prometheus
* Grafana

## API Endpoints

POST `/short`

* Accepts a long URL and converts it to a short one the save it in the database.

GET `/routes`

* displays all the shortend urls from the database

GET `/short/<code>`

* Redirects to the original long URL.

GET `/metrics`

* Exposes Prometheus metrics for monitoring.

## Monitoring & Visualization

* Prometheus UI: `http://localhost:9090`
* Grafana UI: `http://localhost:3000`
  * Default credentials: `admin/admin`

**Metrics Dashboards:**

* Total URLs shortened
* Redirection count
* 95th percentile latency
* 404 errors over time

![1763657230223](images/readme/1763657230223.png)

## Persistence

Docker volumes ensure data is preserved across restarts:

```
volumes:
  db_data:
  prometheus_data:
  grafana_data:


```

* SQLite database persists
* Prometheus data persists
* Grafana dashboards and alert rules persist


## Alerting

Configured in Grafana:

* High request latency alerts
* Spike in 404 errors alerts
