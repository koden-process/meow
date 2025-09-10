#!/bin/sh

# Substitute environment variables in env-config.js
envsubst < /var/www/html/env-config.js > /var/www/html/env-config.tmp.js
mv /var/www/html/env-config.tmp.js /var/www/html/env-config.js

# Start Nginx and the backend server
service nginx start && cd /app/backend && npm start
