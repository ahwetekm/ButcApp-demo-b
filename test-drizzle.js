import { db, users, blogCategories, adminUsers } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function testConnection() {
  try {
    console.log('Testing Drizzle connection...');
    
    // Test basic query
    const result = await db.select().from(users).limit(1);
    console.log('✅ Database connection successful!');
    
    // Check if admin user exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@butcapp.com')).limit(1);
    
    if (existingAdmin.length === 0) {
      console.log('Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const userId = `user_${Date.now()}`;
      
      await db.insert(users).values({
        id: userId,
        email: 'admin@butcapp.com',
        passwordHash: hashedPassword,
        fullName: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Create admin role
      await db.insert(adminUsers).values({
        id: `admin_${Date.now()}`,
        userId: userId,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ Admin user created!');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Check categories
    const categories = await db.select().from(blogCategories);
    console.log(`✅ Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.log('Creating blog categories...');
      
      await db.insert(blogCategories).values([
        {
          id: 'cat_1',
          name: 'Kişisel Finans',
          slug: 'kisisel-finans',
          description: 'Kişisel finans yönetimi ipuçları',
          createdAt: new Date(),
        },
        {
          id: 'cat_2',
          name: 'Yatırım',
          slug: 'yatirim',
          description: 'Yatırım stratejileri ve analizler',
          createdAt: new Date(),
        },
        {
          id: 'cat_3',
          name: 'Bütçe',
          slug: 'butce',
          description: 'Bütçe planlama ve takip',
          createdAt: new Date(),
        },
        {
          id: 'cat_4',
          name: 'Teknoloji',
          slug: 'teknoloji',
          description: 'Finans teknolojileri',
          createdAt: new Date(),
        },
      ]);
      
      console.log('✅ Blog categories created!');
    }
    
    console.log('🎉 Drizzle setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Import eq for queries
import { eq } from 'drizzle-orm';

testConnection();