#!/bin/sh
set -e

PORT="${PORT:-5000}"

# If specific command like "gunicorn ..." was passed
if [ "$#" -gt 0 ] && [ "$1" != "/start.sh" ]; then
    cd /app/backend
    exec "$@"
fi

echo "=================================================="
echo "Starting AI Code Doctor on 0.0.0.0:$PORT"
echo "=================================================="

cd /app/backend
exec gunicorn app:app --bind "0.0.0.0:$PORT" --workers 2 --timeout 120 --access-logfile - --error-logfile -
