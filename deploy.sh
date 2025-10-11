#!/bin/bash

# Anor Learning Platform Deployment Script
echo "🚀 Starting deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p client/uploads
mkdir -p logs

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 client/uploads
chmod +x deploy.sh

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://your-domain.com
NEXT_PUBLIC_APP_NAME=Anor Learning Platform
EOF
fi

if [ ! -f client/.env ]; then
    echo "📝 Creating client/.env file..."
    cat > client/.env << EOF
# Database
DB_TYPE=sqlite
DB_DATABASE=anor.db

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=1d

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=http://your-domain.com

# Email (Eskiz)
ESKIZ_EMAIL=your_eskiz_email@example.com
ESKIZ_PASSWORD=your_eskiz_password

# File Upload
MAX_FILE_SIZE=2147483648
UPLOAD_DEST=./uploads
EOF
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo "🌐 Frontend: http://your-domain.com"
    echo "🔧 Backend API: http://your-domain.com/api"
    echo "📊 Health Check: http://your-domain.com/health"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo "🎉 Deployment completed successfully!"



