#!/bin/bash
set -e

echo "Running database migrations..."
python -c "
from database import Base, engine
from models import *
Base.metadata.create_all(bind=engine)
print('Tables created successfully.')
"

# Seed data if SEED_DATA env is set
if [ "${SEED_DATA}" = "true" ]; then
    echo "Seeding demo data..."
    python seed_data.py
fi

echo "Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
