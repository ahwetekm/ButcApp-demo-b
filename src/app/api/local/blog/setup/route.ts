import { NextRequest, NextResponse } from 'next/server'
import { Database } from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

// SQLite connection
const dbPath = path.join(process.cwd(), 'db', 'custom.db')

async function getDb() {
  return open({
    filename: dbPath,
    driver: Database
  })
}

// POST /api/local/blog/setup - Initialize blog database
export async function POST() {
  try {
    const db = await getDb()
    
    // Create tables one by one
    await db.exec(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        featured_image TEXT,
        author_name TEXT NOT NULL,
        author_avatar TEXT,
        category TEXT NOT NULL,
        tags TEXT,
        meta_title TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        featured INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        reading_time INTEGER,
        published_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#10b981',
        icon TEXT DEFAULT 'BookOpen',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS blog_analytics (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        referrer TEXT,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
      )
    `)
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_email TEXT,
        content TEXT NOT NULL,
        parent_id TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE
      )
    `)
    
    // Create indexes
    await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id)')
    
    // Insert default categories
    await db.exec(`
      INSERT OR IGNORE INTO blog_categories (id, name, slug, description, color, icon) VALUES
      ('1', 'Bütçe Yönetimi', 'butce-yonetimi', 'Kişisel bütçe planlama ve yönetimi ipuçları', '#10b981', 'Calculator'),
      ('2', 'Yatırım', 'yatirim', 'Yatırım stratejileri ve analizleri', '#3b82f6', 'TrendingUp'),
      ('3', 'Birikim', 'birikim', 'Para biriktirme teknikleri ve tasarruf ipuçları', '#8b5cf6', 'PiggyBank'),
      ('4', 'Finansal Okuryazarlık', 'finansal-okuryazarlik', 'Finansal eğitim ve kavramlar', '#f59e0b', 'GraduationCap')
    `)
    
    // Insert sample posts
    await db.exec(`
      INSERT OR IGNORE INTO blog_posts (
        id, title, slug, excerpt, content, author_name, category, tags, status, featured, view_count, reading_time, published_at
      ) VALUES
      ('1', 'Bütçemi Nasıl Daha İyi Yönetebilirim?', 'butcemi-nasil-daha-iyi-yonetebilirim', 
       'Kişisel bütçe yönetiminin temel prensipleri ve etkili stratejiler.',
       'Bütçe yönetimi, finansal sağlığın temelidir. Bu makalede kişisel bütçenizi nasıl daha etkili yönetebileceğinizi anlatıyorum.',
       'ButcApp Ekibi', 'Bütçe Yönetimi', '["bütçe", "finansal planlama"]', 'published', 1, 8, datetime('now')),
       
      ('2', 'Yeni Başlayanlar İçin Yatırım Rehberi', 'yeni-baslayanlar-icin-yatirim-rehberi',
       'Yatırım yapmaya nereden başlamalısınız? Temel kavramlar ve stratejiler.',
       'Yatırım dünyasına ilk adım atmak korkutucu olabilir. Ancak doğru bilgi ve strateji ile herkes yatırım yapabilir.',
       'ButcApp Ekibi', 'Yatırım', '["yatırım", "hisse senedi", "kripto para"]', 'published', 1, 12, datetime('now')),
       
      ('3', '2024''te Para Biriktirmenin 10 Etkili Yolu', '2024te-para-biriktirmenin-10-etkili-yolu',
       'Pratik ve uygulanabilir para biriktirme teknikleri ile finansal hedeflerinize ulaşın.',
       'Para biriktirmek sanıldığı kadar zor değil. İşte 2024 yılında uygulayabileceğiniz 10 etkili yöntem.',
       'ButcApp Ekibi', 'Birikim', '["birikim", "tasarruf", "finansal hedefler"]', 'published', 0, 6, datetime('now')),
       
      ('4', 'Finansal Okuryazarlık: Temel Kavramlar', 'finansal-okuryazarlik-temel-kavramlar',
       'Finansal okuryazarlığınızı artıracak temel kavramları ve önemini öğrenin.',
       'Finansal okuryazarlık modern dünyada herkesin sahip olması gereken bir beceridir. Bu makalede temel kavramları açıklıyorum.',
       'ButcApp Ekibi', 'Finansal Okuryazarlık', '["finansal okuryazarlık", "finansal eğitim"]', 'published', 0, 10, datetime('now'))
    `)
    
    await db.close()
    
    return NextResponse.json({
      success: true,
      message: 'Blog database initialized successfully'
    })
    
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    }, { status: 500 })
  }
}