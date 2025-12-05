#!/bin/bash
# Ubuntu için sqlite3 kurulum script'i
# Bu script'i sunucuda çalıştırın

echo "🔧 Ubuntu için sqlite3 kurulumu başlatılıyor..."

# Paket listesini güncelle
sudo apt update

# sqlite3 kur
sudo apt install -y sqlite3

# Kurulumu kontrol et
if command -v sqlite3 &> /dev/null; then
    echo "✅ sqlite3 başarıyla kuruldu"
    echo "📍 Konum: $(which sqlite3)"
    echo "🔍 Versiyon: $(sqlite3 --version)"
else
    echo "❌ sqlite3 kurulumu başarısız"
    exit 1
fi

# Yetkileri kontrol et
echo ""
echo "📋 Kurulum sonrası kontrol:"
ls -la $(which sqlite3)

echo ""
echo "✅ Kurulum tamamlandı! Yedekleme sistemi çalışmalı."