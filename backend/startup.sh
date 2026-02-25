#!/bin/bash
# Azure App Service startup script.
# Oryx extracts the deployment to a temp directory and invokes this script
# from within that directory — do NOT cd to /home/site/wwwroot.

gunicorn \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  app.main:app \
  --bind 0.0.0.0:8000 \
  --timeout 60 \
  --access-logfile - \
  --error-logfile -
