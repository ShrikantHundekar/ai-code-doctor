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

# Install system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built React frontend to /app/dist
COPY --from=frontend-builder /app/dist ./dist

# Copy and configure startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Create binary cd wrappers everywhere
RUN echo '#!/bin/sh\n\
if [ "$1" = "backend" ] && [ "$2" = "&&" ]; then\n\
    shift 2\n\
    cd /app/backend\n\
    exec "$@"\n\
fi\n\
cd /app/backend\n\
exec /start.sh "$@"\n\
' > /usr/local/bin/cd && \
chmod +x /usr/local/bin/cd && \
ln -sf /usr/local/bin/cd /usr/bin/cd && \
ln -sf /usr/local/bin/cd /bin/cd

ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

EXPOSE 8080
EXPOSE 5000

CMD ["/start.sh"]
