@echo off
REM ButcApp.com Windows Deployment Script

echo 🚀 ButcApp.com VPS deployment başlatılıyor...

REM VPS bilgileri
set VPS_IP=5.133.102.196
set VPS_USER=root
set VPS_DIR=/var/www/butcapp

echo.
echo 🔧 VPS hazırlanıyor...

REM VPS'e bağlan ve hazırlık yap
ssh %VPS_USER%@%VPS_IP% "mkdir -p %VPS_DIR% && echo '✅ VPS hazırlığı tamamlandı'"

echo.
echo 📦 Proje VPS'e kopyalanıyor...

REM VPS'te Git ile kopyala
ssh %VPS_USER%@%VPS_IP% "cd %VPS_DIR% && git clone https://github.com/ButcApp/ButcApp-demo-a.git . && echo '✅ Proje kopyalandı'"

echo.
echo 📝 Environment variables oluşturuluyor...

REM Environment variables oluştur
ssh %VPS_USER%@%VPS_IP% "cd %VPS_DIR% && cat > .env << 'ENVEOF'
DATABASE_URL=file:/var/www/butcapp/db/custom.db
JWT_SECRET=butcapp-secret-key-change-in-production-2024
NEXT_PUBLIC_API_URL=https://butcapp.com
NODE_ENV=production
ENVEOF
echo '✅ Environment variables oluşturuldu'"

echo.
echo 🔧 Kurulum yapılıyor...

REM Kurulum ve başlatma
ssh %VPS_USER%@%VPS_IP% "cd %VPS_DIR% && echo '📦 Dependencies kuruluyor...' && npm install && echo '🗄️ Veritabanı kuruluyor...' && npm run db:push && echo '🔨 Proje build ediliyor...' && npm run build && echo '🚀 Uygulama başlatılıyor...' && pm2 stop butcapp 2>/dev/null || true && pm2 start npm --name 'butcapp' -- start && pm2 save && echo '✅ Kurulum tamamlandı'"

echo.
echo 🎉 ButcApp.com deployment tamamlandı!
echo 🌐 Uygulamanız: https://butcapp.com
echo 🔧 Admin panel: https://butcapp.com/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login
echo.
echo 📋 Test bilgileri:
echo 👤 Kullanıcı: ampulpatlatan
echo 🔑 Şifre: [şifreniz]
echo.
echo 🔧 Kontrol komutları:
echo pm2 status     # Uygulama durumu
echo pm2 logs butcapp  # Logları görüntüle
echo pm2 restart butcapp  # Yeniden başlat

pause