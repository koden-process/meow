FROM node:24

# Install Nginx and gettext (for envsubst)
RUN apt-get update && apt-get install -y nginx gettext

# Remove the default Nginx configuration file
RUN rm /etc/nginx/sites-available/default

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/sites-available/default


# Set up the frontend and backend directories
WORKDIR /app
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Install dependencies for the frontend and backend
RUN cd frontend && npm install
RUN cd backend && npm install

# Build the frontend and copy it to the Nginx document root
RUN cd frontend && npm run build && cp -r build/. /var/www/html

# Copy the startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose port 80 for Nginx
EXPOSE 80

# Environment variables for customization (optional)
# Uncomment and set these variables in your docker-compose.yml or when running the container
# to customize the application appearance:
#
# ENV VITE_CUSTOM_APP_NAME="My Custom App Name"
# ENV VITE_CUSTOM_FAVICON_URL="https://example.com/favicon.svg"
# ENV VITE_CUSTOM_LOGO_URL="https://example.com/logo.svg"
# ENV VITE_CUSTOM_LOGO_ALT="My Logo"
# ENV VITE_CUSTOM_THEME_COLOR="#1D1D1B"
# ENV VITE_CUSTOM_NAVIGATION_COLOR="#067BC2"
#
# Example:
# docker run -e VITE_CUSTOM_APP_NAME="Sales CRM" \
#            -e VITE_CUSTOM_FAVICON_URL="https://cdn.example.com/favicon.svg" \
#            -p 80:80 meow

# Use the startup script
CMD ["/start.sh"]
