# 🚀 Production-Ready GitOps & DevSecOps Pipeline

![Kubernetes](https://img.shields.io/badge/kubernetes-%23326CE5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Helm](https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![ArgoCD](https://img.shields.io/badge/Argo_CD-EF6C00?style=for-the-badge&logo=argo&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

An enterprise-grade, fully automated GitOps CI/CD pipeline built using **GitHub Actions**, **Helm**, and **Argo CD**. The system delivers zero-touch continuous deployment triggered by standard Git release tagging, enforcing shift-left DevSecOps security scanning, code/chart linting, and automated manifest updates.

---

## ✨ Application Overview & Features

The underlying application is a lightweight, cloud-native Node.js Express service designed specifically for containerized Kubernetes workloads.

* **Dynamic Port Configuration**: Application port is fully customizable via the `PORT` environment variable, configured dynamically through Helm `values.yaml`.
* **Observability & Prometheus Integration**: Exposes application health, HTTP response statistics, and runtime metrics via a standard `/metrics` endpoint for Prometheus scraping.
* **Kubernetes Health Probes**: Native readiness (`/ready`) and liveness (`/healthz`) endpoints ensuring reliable routing and pod self-healing.

---

## 🏗️ Architectural Decisions & Engineering Methodology

### 1. Workload Choice: Deployment vs. StatefulSet
* **Choice**: `Deployment`
* **Rationale**: The application is stateless and horizontally scalable. Utilizing `Deployment` resources enables seamless rolling updates, zero-downtime releases, efficient horizontal pod autoscaling (HPA), and avoids the storage overhead associated with `StatefulSet` resources.

### 2. GitOps Repository Strategy: Monorepo Approach
* **Choice**: Single Repository (App code + Helm Chart) monitored directly by Argo CD.
* **Rationale**: Keeps application logic and infrastructure code synchronized within a single source of truth. It simplifies developer feedback loops while maintaining tight coupling between application release versions and Helm manifest configurations.

### 3. Automated GitOps Promotion Flow
* **Tag-Driven Triggers**: Pushing a semantic release tag (e.g., `v1.0.10`) initiates the end-to-end pipeline.
* **Autonomous Manifest Updates**:
  1. The CI pipeline builds and pushes a verified, immutable Docker image tagged with the version number.
  2. The pipeline dynamically updates `charts/sample-nodejs/values.yaml` with the new image tag.
  3. A dedicated GitHub App (`gitops-auto-promoter`) opens a PR and executes an autonomous `auto-merge` (Squash & Merge) via repository ruleset bypass exemptions (`Exempt` status).
  4. Argo CD detects the updated `main` branch and reconciles the cluster state automatically without manual intervention.

---

## 🛡️ DevSecOps & Quality Assurance Controls

The pipeline enforces shift-left security checks and code quality gates at every stage, blocking execution on critical failures:

* **Static Quality & Syntax Linting**:
  * **Code Linting**: `npm run lint` (ESLint) ensures code standard compliance and catches logic flaws.
  * **Helm Chart Validation**: `helm lint` validates chart structure, template syntax, and YAML schemas prior to deployment.
* **SAST & Secret Scanning**: Integrated **Gitleaks** and **Semgrep** scan the codebase for hardcoded credentials, tokens, and static vulnerabilities.
* **Dependency Vulnerability Auditing**: `npm audit` scans Node.js dependencies for known security advisories.
* **Container Security Scanning**: Integrated **Trivy** scans the final Docker image for OS-level and package-level vulnerabilities before pushing to the container registry.

---

## ☸️ Kubernetes Manifest Engineering

* **Resilience & Self-Healing**: Configured `livenessProbe` and `readinessProbe` to manage pod lifecycles and traffic routing cleanly during updates.
* **Resource Management**: Explicit CPU and Memory `requests` and `limits` are defined to enforce Quality of Service (QoS) and prevent cluster resource starvation.
* **Configuration Management**: Decoupled application settings and sensitive credentials utilizing Kubernetes `ConfigMap` and `Secret` resources.
* **Traffic Routing**: Exposed internally via a Kubernetes `Service` and externally through configured `Ingress` controllers.

---

## 📋 Prerequisites

### Local Environment
* **Node.js**: v22.1.0 or higher
* **Local Cluster**: Docker Desktop (Kubernetes enabled), Minikube, or k3d
* **CLI Tools**: `kubectl`, `helm`, `git`, `docker`

### Cluster Infrastructure
* **Argo CD** deployed in the `argocd` namespace.
* **Docker Hub** (or private registry) credentials.
* **GitHub Repository** configured with a custom GitHub App for GitOps promotion.

---

## 🔑 Required Configuration & Secrets

### GitHub Repository Secrets

Configure the following secrets under **Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions**:

| Secret Name | Description |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Container registry username |
| `DOCKERHUB_TOKEN` | Container registry Personal Access Token (PAT) |
| `GITOPS_APP_ID` | Dedicated GitHub App ID for GitOps promotion |
| `GITOPS_APP_PRIVATE_KEY` | Private key (`.pem`) for the GitHub App |

### GitHub Branch Protection / Ruleset Setup
To enable fully autonomous GitOps PR generation and merging:
1. Navigate to **Settings $\rightarrow$ Rules $\rightarrow$ Rulesets** and edit the `main` branch rule.
2. In the **Bypass List**, add the `gitops-auto-promoter` App.
3. Set the bypass privilege level to **`Exempt`**.

---