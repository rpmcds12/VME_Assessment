#!/bin/bash
# Azure App Service startup script
# Runs from /home/site/wwwroot after zip deploy

cd /home/site/wwwroot

gunicorn \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  app.main:app \
  --bind 0.0.0.0:8000 \
  --timeout 60 \
  --access-logfile - \
  --error-logfile -
