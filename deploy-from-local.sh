#!/bin/bash

# ButcApp.com VPS Deployment (Git ile)

echo "🚀 ButcApp.com VPS deployment başlatılıyor..."

# VPS bilgileri
VPS_IP="5.133.102.196"
VPS_USER="root"
VPS_DIR="/var/www/butcapp"

# VPS'e bağlan ve hazırlık yap
echo "🔧 VPS hazırlanıyor..."
ssh $VPS_USER@$VPS_IP << 'EOF'
# Proje dizini oluştur
mkdir -p /var/www/butcapp

# Eski dosyaları yedekle (varsa)
if [ -d "/var/www/butcapp/old" ]; then
    rm -rf /var/www/butcapp/old
fi
if [ -d "/var/www/butcapp/src" ]; then
    mv /var/www/butcapp /var/www/butcapp/old
    mkdir -p /var/www/butcapp
fi

echo "✅ VPS hazırlığı tamamlandı"
EOF

echo "✅ VPS hazırlandı"

# VPS'e bağlan ve Git ile kopyala
echo "📦 Proje VPS'e kopyalanıyor..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/butcapp

# Git ile projeyi klonla
git clone https://github.com/ButcApp/ButcApp-demo-a.git .

# Eğer private repo ise:
# git clone https://github.com/ButcApp/ButcApp-demo-a.git --branch main --single-branch .

echo "✅ Proje kopyalandı"
EOF

# Environment variables oluştur
echo "📝 Environment variables oluşturuluyor..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/butcapp

# .env dosyası oluştur
cat > .env << 'ENVEOF'
DATABASE_URL=file:/var/www/butcapp/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://butcapp.com
NODE_ENV=production
ENVEOF

echo "✅ Environment variables oluşturuldu"
EOF

# Kurulum ve başlatma
echo "🔧 Kurulum yapılıyor..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/butcapp

# Node.js versiyonunu kontrol et
node --version
npm --version

# Dependencies kur
echo "📦 Dependencies kuruluyor..."
npm install

# Veritabanı kurulumu
echo "🗄️ Veritabanı kuruluyor..."
npm run db:push

# Build et
echo "🔨 Proje build ediliyor..."
npm run build

# PM2 ile başlat
echo "🚀 Uygulama başlatılıyor..."
pm2 stop butcapp 2>/dev/null || true
pm2 start npm --name "butcapp" -- start
pm2 save

echo "✅ Kurulum tamamlandı"
EOF

echo ""
echo "🎉 ButcApp.com deployment tamamlandı!"
echo "🌐 Uygulamanız: https://butcapp.com"
echo "🔧 Admin panel: https://butcapp.com/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login"
echo ""
echo "📋 Test bilgileri:"
echo "👤 Kullanıcı: ampulpatlatan"
echo "🔑 Şifre: [şifreniz]"
echo ""
echo "🔧 Kontrol komutları:"
echo "pm2 status     # Uygulama durumu"
echo "pm2 logs butcapp  # Logları görüntüle"
echo "pm2 restart butcapp  # Yeniden başlat"