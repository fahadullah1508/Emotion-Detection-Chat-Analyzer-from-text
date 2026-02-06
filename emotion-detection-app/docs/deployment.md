# Deployment Guide

## Emotion Detection from Text (Chat Analyzer)

---

## Table of Contents

1. [Local Deployment](#local-deployment)
2. [Production Deployment](#production-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Local Deployment

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn package manager
- Git (optional)

### Step 1: Project Setup

```bash
# Clone or extract the project
cd emotion-detection-app

# Project structure should look like:
# emotion-detection-app/
# ├── backend/
# ├── frontend/
# ├── ml_model/
# └── data/
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import flask; import sklearn; print('Dependencies installed successfully')"
```

### Step 3: Verify Model Files

```bash
# Check if model files exist
ls model/

# Expected output:
# emotion_model.pkl
# tfidf_vectorizer.pkl
# model_info.pkl

# If missing, train the model
cd ../ml_model
python train_emotion_model.py
cd ../backend
```

### Step 4: Start Backend Server

```bash
# Start Flask development server
python app.py

# Or use Gunicorn (if installed)
gunicorn -w 2 -b 127.0.0.1:5000 app:app

# Server should start on http://localhost:5000
```

### Step 5: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend should start on http://localhost:5173
```

### Step 6: Verify Deployment

1. Open browser to http://localhost:5173
2. Check backend health: http://localhost:5000/health
3. Test API: http://localhost:5000/emotions

---

## Production Deployment

### Server Requirements

- Ubuntu 20.04 LTS or higher (recommended)
- 2 CPU cores minimum
- 4 GB RAM minimum
- 20 GB storage minimum

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y build-essential git curl wget

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Verify installations
python3 --version
node --version
nginx -v
```

### Step 2: Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/emotion-detection
cd /var/www/emotion-detection

# Copy application files (from local machine)
# Option 1: Using scp
scp -r /local/path/to/emotion-detection-app/* user@server:/var/www/emotion-detection/

# Option 2: Using git
git clone <your-repository-url> .

# Set ownership
sudo chown -R www-data:www-data /var/www/emotion-detection
```

### Step 3: Backend Configuration

```bash
# Create virtual environment
sudo python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Deactivate
 deactivate
```

### Step 4: Frontend Build

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy build to web root
sudo cp -r dist/* /var/www/html/

# Or serve from application directory
sudo mkdir -p /var/www/emotion-detection/frontend/dist
sudo cp -r dist/* /var/www/emotion-detection/frontend/dist/
```

### Step 5: Gunicorn Service

Create service file:

```bash
sudo nano /etc/systemd/system/emotion-detection.service
```

Add content:

```ini
[Unit]
Description=Emotion Detection API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/emotion-detection/backend
Environment="PATH=/var/www/emotion-detection/venv/bin"
Environment="FLASK_ENV=production"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/var/www/emotion-detection/venv/bin/gunicorn \
    -w 4 \
    -b 127.0.0.1:5000 \
    --access-logfile /var/log/emotion-detection/access.log \
    --error-logfile /var/log/emotion-detection/error.log \
    --capture-output \
    --enable-stdio-inheritance \
    app:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Create log directory:

```bash
sudo mkdir -p /var/log/emotion-detection
sudo chown -R www-data:www-data /var/log/emotion-detection
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable emotion-detection
sudo systemctl start emotion-detection

# Check status
sudo systemctl status emotion-detection

# View logs
sudo journalctl -u emotion-detection -f
```

### Step 6: Nginx Configuration

Create site configuration:

```bash
sudo nano /etc/nginx/sites-available/emotion-detection
```

Add content:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Frontend - Static files
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint (optional)
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}
```

Enable site:

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable emotion-detection site
sudo ln -s /etc/nginx/sites-available/emotion-detection /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts to complete setup

# Auto-renewal test
sudo certbot renew --dry-run
```

### Step 8: Firewall Configuration

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Docker Deployment

### Dockerfile for Backend

```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Run with Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Dockerfile for Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: emotion-api
    restart: always
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./backend/model:/app/model:ro
    networks:
      - emotion-network

  frontend:
    build: ./frontend
    container_name: emotion-web
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - emotion-network

  nginx:
    image: nginx:alpine
    container_name: emotion-proxy
    restart: always
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - emotion-network

networks:
  emotion-network:
    driver: bridge
```

### Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Cloud Deployment

### AWS Deployment

#### Option 1: EC2 Instance

```bash
# Launch EC2 instance (t3.medium recommended)
# Use Ubuntu 20.04 AMI

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow Production Deployment steps above
```

#### Option 2: Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
cd emotion-detection-app
 eb init -p python-3.9 emotion-detection

# Create environment
eb create emotion-detection-env

# Deploy
eb deploy
```

### Google Cloud Platform

```bash
# Create VM instance
gcloud compute instances create emotion-detection \
    --machine-type=e2-medium \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud

# SSH to instance
gcloud compute ssh emotion-detection

# Follow Production Deployment steps
```

### Azure

```bash
# Create VM
az vm create \
    --resource-group myResourceGroup \
    --name emotion-detection \
    --image UbuntuLTS \
    --size Standard_B2s

# SSH to VM
ssh azureuser@your-vm-ip

# Follow Production Deployment steps
```

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

```bash
# Check if port 5000 is in use
sudo lsof -i :5000

# Kill process if needed
sudo kill -9 <PID>

# Check Python dependencies
pip list | grep -E "flask|scikit-learn"

# Check model files exist
ls -la backend/model/
```

#### 2. Frontend Build Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Check Node version
node --version  # Should be 18+
```

#### 3. Nginx 502 Bad Gateway

```bash
# Check if backend is running
sudo systemctl status emotion-detection

# Check backend logs
sudo journalctl -u emotion-detection -n 50

# Test backend directly
curl http://127.0.0.1:5000/health

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. CORS Errors

```bash
# Check Flask CORS configuration
# In app.py, ensure CORS is properly configured:

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "https://yourdomain.com"]
    }
})
```

#### 5. Permission Denied

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/emotion-detection

# Fix permissions
sudo chmod -R 755 /var/www/emotion-detection

# For log files
sudo chmod 644 /var/log/emotion-detection/*.log
```

### Performance Tuning

#### Gunicorn Optimization

```ini
# /etc/systemd/system/emotion-detection.service
ExecStart=/var/www/emotion-detection/venv/bin/gunicorn \
    -w 4 \                          # Workers (2-4 x CPU cores)
    -k uvicorn.workers.UvicornWorker \  # Async worker class
    -b 127.0.0.1:5000 \
    --worker-connections 1000 \     # Max concurrent connections
    --max-requests 1000 \           # Restart after N requests
    --max-requests-jitter 50 \      # Random jitter
    --timeout 30 \                  # Request timeout
    --keep-alive 2 \                # Keep-alive timeout
    --access-logfile - \
    --error-logfile - \
    app:app
```

#### Nginx Optimization

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript;
}
```

---

## Maintenance

### Regular Tasks

```bash
# Check service status
sudo systemctl status emotion-detection
sudo systemctl status nginx

# View logs
sudo journalctl -u emotion-detection -f
sudo tail -f /var/log/nginx/access.log

# Update application
cd /var/www/emotion-detection
git pull
source venv/bin/activate
pip install -r backend/requirements.txt
cd frontend && npm install && npm run build
sudo systemctl restart emotion-detection

# Renew SSL certificates
sudo certbot renew
```

### Backup Strategy

```bash
# Backup model files
sudo tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/emotion-detection/backend/model/

# Backup configuration
sudo tar -czf config-backup-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/ /etc/systemd/system/emotion-detection.service

# Automated backup (add to crontab)
0 2 * * * /path/to/backup-script.sh
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-06  
**Author**: DevOps Engineer
