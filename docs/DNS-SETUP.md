# DNS Configuration Checklist for butcapp.com

## ⚠️ ÖNCE DNS AYARLARINI YAPIN!

### 🌐 Gerekli DNS Kayıtları:

#### 1. A Record (Zorunlu)
```
Type: A
Name: @ (veya butcapp.com)
Value: 5.133.102.196
TTL: 3600 (veya 1 saat)
```

#### 2. A Record (www subdomain)
```
Type: A
Name: www
Value: 5.133.102.196
TTL: 3600 (veya 1 saat)
```

#### 3. CNAME Record (Opsiyonel ama önerili)
```
Type: CNAME
Name: www
Value: butcapp.com
TTL: 3600
```

### 🔍 DNS Kontrol Komutları:
```bash
# DNS propagation kontrolü
dig butcapp.com A
dig www.butcapp.com A
nslookup butcapp.com
nslookup www.butcapp.com

# Domain pointing kontrolü
host butcapp.com
host www.butcapp.com

# Worldwide DNS kontrolü
for server in 8.8.8.8 1.1.1.1 208.67.222.222; do
    echo "Checking from server $server:"
    dig @$server butcapp.com A +short
done
```

### 🏢 Popular DNS Providers:

#### Cloudflare:
1. Cloudflare hesabınıza giriş yapın
2. butcapp.com domain'ini seçin
3. DNS sekmesine gidin
4. A record ekleyin:
   - Type: A
   - Name: @
   - IPv4 address: 5.133.102.196
   - Proxy status: DNS only (grey cloud)
5. www için de aynı işlemi yapın

#### GoDaddy:
1. GoDaddy DNS Management'e gidin
2. butcapp.com'u seçin
3. Add Record -> A
4 - Type: A
   - Name: @
   - Value: 5.133.102.196
   - TTL: 1 Hour
5. www için tekrarlayın

#### Namecheap:
1. Domain List -> butcapp.com -> Manage
2. Advanced DNS sekmesi
3. Add New Record
4 - Type: A Record
   - Host: @
   - Value: 5.133.102.196
   - TTL: 1800
5. www için tekrarlayın

### ⏱️ DNS Propagation Süresi:
- Normal: 5-30 dakika
- Global: 24-48 saat
- TTL etkili: Domain'in TTL ayarına bağlı

### 🧪 Test Etme:
DNS ayarları yaptıktan sonra bu komutla test edin:
```bash
# Doğru IP'yi göstermeli
dig butcapp.com A +short

# Sonuç: 5.133.102.196 olmalı
```