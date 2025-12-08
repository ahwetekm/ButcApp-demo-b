#!/bin/bash

# Database Setup and Migration Script for ButcApp
# SQLite veritabanı kurulumu ve migrasyon script'i

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

echo "🗄️ Database Setup and Migration Script Başlatılıyor..."
echo ""

# Değişkenler
PROJECT_DIR="/var/www/butcapp"
DB_DIR="/var/lib/butcapp"
DB_FILE="$DB_DIR/butcapp.db"
BACKUP_DIR="/var/backups/butcapp"

# 1. Proje Dizini Kontrolü
if [ ! -d "$PROJECT_DIR" ]; then
    error "Proje dizini bulunamadı: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

# 2. Database Dizini Oluşturma
log "Veritabanı dizini oluşturuluyor..."
sudo mkdir -p $DB_DIR
sudo mkdir -p $BACKUP_DIR

# 3. İzinleri Ayarlama
log "Veritabanı dizini izinleri ayarlanıyor..."
sudo chown -R $USER:$USER $DB_DIR
sudo chown -R $USER:$USER $BACKUP_DIR
sudo chmod 755 $DB_DIR
sudo chmod 755 $BACKUP_DIR

# 4. SQLite Kurulum Kontrolü
if ! command -v sqlite3 &> /dev/null; then
    log "SQLite kuruluyor..."
    sudo apt update
    sudo apt install -y sqlite3
else
    info "SQLite zaten kurulu: $(sqlite3 --version)"
fi

# 5. Mevcut Veritabanı Yedeği
if [ -f "$DB_FILE" ]; then
    warn "Mevcut veritabanı yedekleniyor..."
    cp $DB_FILE $BACKUP_DIR/butcapp_backup_$(date +%Y%m%d_%H%M%S).db
fi

# 6. Drizzle Kurulum Kontrolü
if [ ! -f "package.json" ]; then
    error "package.json bulunamadı. Proje dizininde olduğunuzdan emin olun."
    exit 1
fi

# 7. Dependencies Kurulumu
log "Dependencies kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
    log "Dependencies kuruluyor..."
    pnpm install
fi

# 8. Drizzle Konfigürasyonu Kontrolü
if [ ! -f "drizzle.config.ts" ] && [ ! -f "drizzle.config.js" ]; then
    warn "Drizzle konfigürasyon dosyası bulunamadı. Varsayılan konfigürasyon oluşturuluyor..."
    
    cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'sqlite:///var/lib/butcapp/butcapp.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;
EOF
fi

# 9. Environment Variables Kontrolü
if [ ! -f ".env.production" ]; then
    warn ".env.production dosyası bulunamadı. Oluşturuluyor..."
    
    JWT_SECRET=$(openssl rand -base64 64)
    SESSION_SECRET=$(openssl rand -base64 64)
    
    cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=3001
DOMAIN=butcapp.com

# Database (SQLite)
DATABASE_URL=sqlite:///var/lib/butcapp/butcapp.db

# JWT Secret
JWT_SECRET=$JWT_SECRET

# API Keys (bunları production'da güncelleyin)
NEXT_PUBLIC_API_URL=https://butcapp.com
API_URL=https://butcapp.com

# Session Secret
SESSION_SECRET=$SESSION_SECRET

# Email (isteğe bağlı)
EMAIL_FROM=noreply@butcapp.com
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Analytics (isteğe bağlı)
GOOGLE_ANALYTICS_ID=
VERCEL_ANALYTICS_ID=

# Redis (isteğe bağlı)
REDIS_URL=redis://localhost:6379

# Log level
LOG_LEVEL=info
EOF
    
    chmod 600 .env.production
    log ".env.production dosyası oluşturuldu"
fi

# 10. Database Schema Kontrolü
if [ ! -f "src/lib/db/schema.ts" ]; then
    warn "Database schema dosyası bulunamadı. Varsayılan schema oluşturuluyor..."
    
    mkdir -p src/lib/db
    
    cat > src/lib/db/schema.ts << 'EOF'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Categories table
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'income' or 'expense'
  color: text('color').notNull().default('#000000'),
  icon: text('icon').default(''),
  userId: integer('user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  categoryId: integer('category_id').notNull(),
  userId: integer('user_id').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  type: text('type').notNull(), // 'income' or 'expense'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Recurring Transactions table
export const recurringTransactions = sqliteTable('recurring_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  categoryId: integer('category_id').notNull(),
  userId: integer('user_id').notNull(),
  frequency: text('frequency').notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  nextDate: integer('next_date', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Notes table
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  userId: integer('user_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Balances table
export const balances = sqliteTable('balances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('TRY'),
  userId: integer('user_id').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Blog Posts table
export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt').default(''),
  featuredImage: text('featured_image').default(''),
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived'
  categoryId: integer('category_id'),
  authorId: integer('author_id').notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Blog Categories table
export const blogCategories = sqliteTable('blog_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// System Logs table
export const systemLogs = sqliteTable('system_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  level: text('level').notNull(), // 'info', 'warn', 'error', 'debug'
  message: text('message').notNull(),
  context: text('context').default('{}'), // JSON string
  userId: integer('user_id'),
  ip: text('ip').default(''),
  userAgent: text('user_agent').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
EOF
    
    log "Varsayılan database schema oluşturuldu"
fi

# 11. Database Migration
log "Veritabanı migrasyonu başlatılıyor..."

# Environment variables'ı yükle
export $(cat .env.production | grep -v '^#' | xargs)

# Drizzle push ile migrasyon yap
if pnpm run db:push; then
    log "✅ Veritabanı migrasyonu başarıyla tamamlandı"
else
    error "❌ Veritabanı migrasyonu başarısız"
    exit 1
fi

# 12. Veritabanı Kontrolü
if [ -f "$DB_FILE" ]; then
    log "✅ Veritabanı dosyası oluşturuldu: $DB_FILE"
    
    # Veritabanı bilgileri
    DB_SIZE=$(du -h $DB_FILE | cut -f1)
    info "Veritabanı boyutu: $DB_SIZE"
    
    # Tabloları kontrol et
    TABLES=$(sqlite3 $DB_FILE ".tables" 2>/dev/null)
    if [ -n "$TABLES" ]; then
        log "Oluşturulan tablolar: $TABLES"
    else
        warn "Tablolar bulunamadı"
    fi
else
    error "Veritabanı dosyası oluşturulamadı"
    exit 1
fi

# 13. İzinleri Ayarla
log "Veritabanı dosyası izinleri ayarlanıyor..."
sudo chmod 644 $DB_FILE
sudo chown $USER:$USER $DB_FILE

# 14. Backup Script'i Oluştur
log "Backup script'i oluşturuluyor..."
cat > backup-db.sh << 'EOF'
#!/bin/bash

# Database Backup Script
DB_DIR="/var/lib/butcapp"
BACKUP_DIR="/var/backups/butcapp"
DB_FILE="$DB_DIR/butcapp.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup dizini kontrol
mkdir -p $BACKUP_DIR

# Veritabanı yedeği
if [ -f "$DB_FILE" ]; then
    cp $DB_FILE $BACKUP_DIR/butcapp_backup_$DATE.db
    gzip $BACKUP_DIR/butcapp_backup_$DATE.db
    
    # Eski yedekleri temizle (7 gün)
    find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
    
    echo "Database backup completed: $BACKUP_DIR/butcapp_backup_$DATE.db.gz"
else
    echo "Database file not found: $DB_FILE"
    exit 1
fi
EOF

chmod +x backup-db.sh

# 15. Cron Job Ekle
log "Backup cron job ekleniyor..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup-db.sh") | crontab -

# 16. Test Verisi (isteğe bağlı)
read -p "Test verisi eklemek istiyor musunuz? (e/H): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ee]$ ]]; then
    log "Test verisi ekleniyor..."
    
    # Test kullanıcı ekle
    sqlite3 $DB_FILE << 'EOF'
INSERT OR IGNORE INTO users (email, password, name, role) VALUES 
('admin@butcapp.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjO', 'Admin User', 'admin'),
('user@butcapp.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjO', 'Test User', 'user');
EOF
    
    # Test kategorileri ekle
    sqlite3 $DB_FILE << 'EOF'
INSERT OR IGNORE INTO categories (name, type, color, icon, userId) VALUES 
('Maaş', 'income', '#10B981', 'dollar-sign', 1),
('Yemek', 'expense', '#EF4444', 'utensils', 1),
('Ulaşım', 'expense', '#F59E0B', 'car', 1),
('Alışveriş', 'expense', '#8B5CF6', 'shopping-cart', 1);
EOF
    
    log "Test verisi eklendi"
fi

# 17. Son Kontroller
log "Son kontroller yapılıyor..."

# Veritabanı bağlantı testi
if sqlite3 $DB_FILE "SELECT 1;" > /dev/null 2>&1; then
    log "✅ Veritabanı bağlantısı başarılı"
else
    error "❌ Veritabanı bağlantısı başarısız"
fi

# Tablo sayısı kontrolü
TABLE_COUNT=$(sqlite3 $DB_FILE "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null)
info "Toplam tablo sayısı: $TABLE_COUNT"

echo ""
log "✅ Database kurulumu ve migrasyonu tamamlandı!"
echo ""
echo -e "${GREEN}📋 Veritabanı Bilgileri:${NC}"
echo "- Veritabanı dosyası: $DB_FILE"
echo "- Boyutu: $(du -h $DB_FILE | cut -f1)"
echo "- Tablo sayısı: $TABLE_COUNT"
echo "- Backup dizini: $BACKUP_DIR"
echo "- Backup script: $PROJECT_DIR/backup-db.sh"
echo ""
echo -e "${GREEN}📋 Yararlı Komutlar:${NC}"
echo "- Veritabanını aç: sqlite3 $DB_FILE"
echo "- Tabloları listele: sqlite3 $DB_FILE '.tables'"
echo "- Schema göster: sqlite3 $DB_FILE '.schema'"
echo "- Manuel backup: $PROJECT_DIR/backup-db.sh"
echo "- Backup log: grep 'Database backup' /var/log/cron.log"
echo ""
echo -e "${GREEN}📋 Önemli Notlar:${NC}"
echo "- Veritabanı SQLite kullanıyor (PostgreSQL/MySQL değil)"
echo "- Otomatik backup her gün saat 02:00'da yapılır"
echo "- Backup dosyaları 7 gün saklanır"
echo "- Veritabanı dosyası izinleri: 644"
echo "- Production ortamında test verisi kullanmayın"
echo ""
echo -e "${GREEN}🎉 Veritabanı hazır!${NC}"