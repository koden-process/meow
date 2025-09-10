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

# Use the startup script
CMD ["/start.sh"]
