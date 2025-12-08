#!/bin/bash

# PM2 Production Setup Script for ButcApp

echo "🚀 Starting PM2 Production Setup for ButcApp..."

# 1. Stop existing processes
echo "📋 Stopping existing PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# 2. Create log directories
echo "📁 Creating log directories..."
sudo mkdir -p /var/log/pm2
sudo chown -R root:root /var/log/pm2
sudo chmod -R 755 /var/log/pm2

# 3. Create database directory
echo "🗄️ Creating database directory..."
mkdir -p /var/www/butcapp/db

# 4. Setup database
echo "🗄️ Setting up database..."
cd /var/www/butcapp
pnpm run db:push

# 5. Start with PM2
echo "🚀 Starting ButcApp with PM2..."
pm2 start ecosystem.config.js --env production

# 6. Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# 7. Setup PM2 startup script
echo "🔧 Setting up PM2 startup script..."
pm2 startup

# 8. Show status
echo "📊 PM2 Status:"
pm2 status

echo "✅ PM2 Setup Complete!"
echo "🌐 App should be running at: http://$(curl -s ifconfig.me):3000"
echo "📋 PM2 Commands:"
echo "  pm2 status     - Show process status"
echo "  pm2 logs butcapp - View logs"
echo "  pm2 restart butcapp - Restart app"
echo "  pm2 stop butcapp - Stop app"
echo "  pm2 monit - Monitor processes"