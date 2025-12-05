#!/bin/bash

# ButcApp.com VPS Deployment Script

echo "🚀 ButcApp.com VPS deployment başlatılıyor..."

# Set variables
VPS_IP="your-vps-ip"
DOMAIN="butcapp.com"
PROJECT_DIR="/var/www/butcapp"

# Update .env file for VPS
echo "📝 Environment variables güncelleniyor..."
cat > /tmp/vps-env << EOF
DATABASE_URL=file:$PROJECT_DIR/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://$DOMAIN
EOF

# Copy project to VPS
echo "📦 Proje VPS'e kopyalanıyor..."
scp -r /home/z/my-project/* root@$VPS_IP:$PROJECT_DIR/

# Copy environment file
scp /tmp/vps-env root@$VPS_IP:$PROJECT_DIR/.env

# Setup on VPS
echo "🔧 VPS'te kurulum yapılıyor..."
ssh root@$VPS_IP << 'EOF'
cd /var/www/butcapp

# Install dependencies
echo "📦 Dependencies kuruluyor..."
npm install

# Setup database
echo "🗄️ Veritabanı kuruluyor..."
npm run db:push

# Build project
echo "🔨 Proje build ediliyor..."
npm run build

# Start with PM2
echo "🚀 Uygulama başlatılıyor..."
pm2 start npm --name "butcapp" -- start
pm2 save
pm2 startup

echo "✅ VPS kurulumu tamamlandı!"
EOF

# Clean up
rm /tmp/vps-env

echo "🎉 ButcApp.com deployment tamamlandı!"
echo "🌐 Uygulamanız: https://$DOMAIN"
echo "🔧 Admin panel: https://$DOMAIN/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login"
echo ""
echo "📋 Test et:"
echo "1. Kullanıcı: ampulpatlatan"
echo "2. Şifre: [şifreniz]"
echo "3. Server-status sayfasını kontrol et"