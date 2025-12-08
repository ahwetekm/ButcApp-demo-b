#!/bin/bash

# VPS Deployment Script for ButcApp

echo "🚀 Starting VPS deployment..."

# Set variables
VPS_DOMAIN="your-vps-domain.com"
PROJECT_DIR="/path/to/your/project/on/vps"

# Update .env file for VPS
echo "📝 Updating environment variables..."
cat > $PROJECT_DIR/.env << EOF
DATABASE_URL=file:$PROJECT_DIR/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://$VPS_DOMAIN
EOF

# Install dependencies
echo "📦 Installing dependencies..."
cd $PROJECT_DIR
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Setup database
echo "🗄️ Setting up database..."
npm run db:push

# Start the application
echo "🚀 Starting the application..."
npm start

echo "✅ Deployment completed!"
echo "🌐 Your app is available at: https://$VPS_DOMAIN"
echo "🔧 Admin panel: https://$VPS_DOMAIN/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login"