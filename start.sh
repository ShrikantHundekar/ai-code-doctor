#!/bin/sh
set -e

PORT="${PORT:-5000}"

# If Railway or any system passed "cd backend && ..." as arguments
if [ "$1" = "cd" ] && [ "$2" = "backend" ] && [ "$3" = "&&" ]; then
    shift 3
fi

# If specific command like "gunicorn ..." was passed
if [ "$#" -gt 0 ] && [ "$1" != "/start.sh" ]; then
    cd /app/backend
    exec "$@"
fi

echo "=================================================="
echo "Starting AI Code Doctor on 0.0.0.0:$PORT"
echo "=================================================="

cd /app/backend

# Pre-initialize database once in main process before spawning workers
python -c "from app import app; from database import init_db; init_db(app)" || true

# Start gunicorn
exec gunicorn app:app --bind "0.0.0.0:$PORT" --workers 2 --timeout 120 --access-logfile - --error-logfile -
