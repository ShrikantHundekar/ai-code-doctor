# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Python Backend with Gunicorn
FROM python:3.11-slim
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built React frontend to /app/dist so backend/app.py can serve it
COPY --from=frontend-builder /app/dist ./dist

ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Railway / Render injects PORT dynamically
EXPOSE 5000

CMD ["sh", "-c", "exec gunicorn app:app --bind 0.0.0.0:${PORT:-5000} --workers 2 --timeout 120"]
