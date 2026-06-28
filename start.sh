#!/bin/sh

echo "🚀 Starting container initialization..."

# Set default empty values for undefined environment variables
export VITE_CUSTOM_THEME_COLOR="${VITE_CUSTOM_THEME_COLOR:-}"
export VITE_CUSTOM_LOGO_URL="${VITE_CUSTOM_LOGO_URL:-}"
export VITE_CUSTOM_FAVICON_URL="${VITE_CUSTOM_FAVICON_URL:-}"
export VITE_CUSTOM_LOGO_ALT="${VITE_CUSTOM_LOGO_ALT:-}"
export VITE_CUSTOM_NAVIGATION_COLOR="${VITE_CUSTOM_NAVIGATION_COLOR:-}"
export VITE_CUSTOM_APP_NAME="${VITE_CUSTOM_APP_NAME:-}"
export VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL="${VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL:-}"

# Debug: Show environment variables
echo "📋 Environment variables:"
echo "  VITE_CUSTOM_THEME_COLOR: $VITE_CUSTOM_THEME_COLOR"
echo "  VITE_CUSTOM_LOGO_URL: $VITE_CUSTOM_LOGO_URL"
echo "  VITE_CUSTOM_FAVICON_URL: $VITE_CUSTOM_FAVICON_URL"
echo "  VITE_CUSTOM_LOGO_ALT: $VITE_CUSTOM_LOGO_ALT"
echo "  VITE_CUSTOM_NAVIGATION_COLOR: $VITE_CUSTOM_NAVIGATION_COLOR"
echo "  VITE_CUSTOM_APP_NAME: $VITE_CUSTOM_APP_NAME"
echo "  VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL: $VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL"

# Debug: Show original env-config.js
echo "📄 Original env-config.js:"
cat /var/www/html/env-config.js

# Substitute environment variables in env-config.js
echo "🔄 Substituting environment variables..."
envsubst '$VITE_CUSTOM_THEME_COLOR,$VITE_CUSTOM_LOGO_URL,$VITE_CUSTOM_FAVICON_URL,$VITE_CUSTOM_LOGO_ALT,$VITE_CUSTOM_NAVIGATION_COLOR,$VITE_CUSTOM_APP_NAME,$VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL' < /var/www/html/env-config.js > /var/www/html/env-config.tmp.js
mv /var/www/html/env-config.tmp.js /var/www/html/env-config.js

# Debug: Show substituted env-config.js
echo "✅ Substituted env-config.js:"
cat /var/www/html/env-config.js

echo "🌐 Starting services..."
# Start Nginx and the backend server
service nginx start && cd /app/backend && npm start
