# 🚀 Plimsoll AI - Global Deployment Guide

This repository is containerized and ready for global deployment using Docker.

## Prerequisites
- Docker & Docker Compose installed
- Git
- NVIDIA Container Toolkit (Optional, for GPU acceleration)

## Quick Start (Production)

1. **Build and Run Containers**
   ```bash
   docker-compose up --build -d
   ```

2. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000/docs
   - **Mobile App**: Connect via Expo Go to your machine's IP

## Architecture
- **Frontend**: React + Vite (served via Nginx Alpine)
- **Backend**: FastAPI + Uvicorn (Python 3.10 Slim)
- **Database**: SQLite (Persisted in `./backend/app` volume)
- **AI Engine**: Ultralytics YOLOv8 + SAM + PaddleOCR (Optimized for CPU/GPU)

## Troubleshooting
- **Port Conflicts**: If port 3000 or 8000 is taken, update `docker-compose.yml`.
- **GPU Access**: Ensure `nvidia-container-toolkit` is installed and uncomment the `deploy` section in `docker-compose.yml` (future enhancement).
