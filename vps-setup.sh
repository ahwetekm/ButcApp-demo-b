#!/bin/bash

# VPS Setup Script for ButcApp
echo "🚀 Starting VPS setup for ButcApp..."

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/butcapp/db
sudo mkdir -p /var/www/butcapp/logs

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R $USER:$USER /var/www/butcapp
sudo chmod -R 755 /var/www/butcapp

# Copy database if it exists
if [ -f "/home/z/my-project/db/custom.db" ]; then
    echo "💾 Copying database..."
    cp /home/z/my-project/db/custom.db /var/www/butcapp/db/
fi

# Install required system packages
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y sqlite3 build-essential

# Set environment variables
echo "🌍 Setting up environment..."
export NODE_ENV=production
export DATABASE_URL="file:/var/www/butcapp/db/custom.db"
export JWT_SECRET="butcapp-secret-key-change-in-production-2024"

# Install Node.js dependencies
echo "📚 Installing Node.js dependencies..."
cd /home/z/my-project
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ VPS setup complete!"
echo "🎯 You can now start the application with: npm start"