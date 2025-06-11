#!/bin/sh
while ! nc -z db 5432; do
  sleep 0.5
done

python manage.py migrate
export PGPASSWORD=01233210
psql -h db -U postgres -d AI_module -f /app/data/data.sql
python manage.py collectstatic --noinput

gunicorn --bind 0.0.0.0:8000 --timeout 60 ai_back.wsgi:application
