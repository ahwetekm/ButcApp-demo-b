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

// POST /api/local/blog/sample - Add sample posts
export async function POST() {
  try {
    const db = await getDb()
    
    // Clear existing posts
    await db.exec('DELETE FROM blog_posts')
    
    // Insert sample posts
    const posts = [
      {
        id: '1',
        title: 'Bütçemi Nasıl Daha İyi Yönetebilirim?',
        slug: 'butcemi-nasil-daha-iyi-yonetebilirim',
        excerpt: 'Kişisel bütçe yönetiminin temel prensipleri ve etkili stratejiler.',
        content: 'Bütçe yönetimi, finansal sağlığın temelidir. Bu makalede kişisel bütçenizi nasıl daha etkili yönetebileceğinizi anlatıyorum.',
        author_name: 'ButcApp Ekibi',
        category: 'Bütçe Yönetimi',
        tags: JSON.stringify(['bütçe', 'finansal planlama']),
        status: 'published',
        featured: 1,
        view_count: 1250,
        reading_time: 8,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Yeni Başlayanlar İçin Yatırım Rehberi',
        slug: 'yeni-baslayanlar-icin-yatirim-rehberi',
        excerpt: 'Yatırım yapmaya nereden başlamalısınız? Temel kavramlar ve stratejiler.',
        content: 'Yatırım dünyasına ilk adım atmak korkutucu olabilir. Ancak doğru bilgi ve strateji ile herkes yatırım yapabilir.',
        author_name: 'ButcApp Ekibi',
        category: 'Yatırım',
        tags: JSON.stringify(['yatırım', 'hisse senedi', 'kripto para']),
        status: 'published',
        featured: 1,
        view_count: 890,
        reading_time: 12,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: '2024\'te Para Biriktirmenin 10 Etkili Yolu',
        slug: '2024te-para-biriktirmenin-10-etkili-yolu',
        excerpt: 'Pratik ve uygulanabilir para biriktirme teknikleri ile finansal hedeflerinize ulaşın.',
        content: 'Para biriktirmek sanıldığı kadar zor değil. İşte 2024 yılında uygulayabileceğiniz 10 etkili yöntem.',
        author_name: 'ButcApp Ekibi',
        category: 'Birikim',
        tags: JSON.stringify(['birikim', 'tasarruf', 'finansal hedefler']),
        status: 'published',
        featured: 0,
        view_count: 756,
        reading_time: 6,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Finansal Okuryazarlık: Temel Kavramlar',
        slug: 'finansal-okuryazarlik-temel-kavramlar',
        excerpt: 'Finansal okuryazarlığınızı artıracak temel kavramları ve önemini öğrenin.',
        content: 'Finansal okuryazarlık modern dünyada herkesin sahip olması gereken bir beceridir. Bu makalede temel kavramları açıklıyorum.',
        author_name: 'ButcApp Ekibi',
        category: 'Finansal Okuryazarlık',
        tags: JSON.stringify(['finansal okuryazarlık', 'finansal eğitim']),
        status: 'published',
        featured: 0,
        view_count: 543,
        reading_time: 10,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    for (const post of posts) {
      await db.run(`
        INSERT INTO blog_posts (
          id, title, slug, excerpt, content, author_name, category, tags, 
          status, featured, view_count, reading_time, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        post.id, post.title, post.slug, post.excerpt, post.content, post.author_name,
        post.category, post.tags, post.status, post.featured, post.view_count,
        post.reading_time, post.published_at, post.created_at, post.updated_at
      ])
    }
    
    await db.close()
    
    return NextResponse.json({
      success: true,
      message: 'Sample posts added successfully'
    })
    
  } catch (error) {
    console.error('Sample posts error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add sample posts',
      details: error.message
    }, { status: 500 })
  }
}