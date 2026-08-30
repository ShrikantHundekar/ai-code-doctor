#!/bin/sh
set -e

# Default to 5000 if PORT is not set
PORT="${PORT:-5000}"

echo "=================================================="
echo "Starting AI Code Doctor on 0.0.0.0:$PORT"
echo "=================================================="

cd /app/backend
exec gunicorn app:app --bind "0.0.0.0:$PORT" --workers 2 --timeout 120 --access-logfile - --error-logfile -
