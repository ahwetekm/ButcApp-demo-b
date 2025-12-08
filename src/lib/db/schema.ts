import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Users table for authentication
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  fullName: text('fullName'),
  avatarUrl: text('avatarUrl'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// User profile data
export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('userId').unique().notNull(),
  email: text('email').notNull(),
  fullName: text('fullName'),
  avatarUrl: text('avatarUrl'),
  cash: real('cash').default(0),
  bank: real('bank').default(0),
  savings: real('savings').default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// User financial data
export const userData = sqliteTable('user_data', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').notNull(), // 'income', 'expense', 'recurring', 'note'
  amount: real('amount'),
  description: text('description'),
  category: text('category'),
  date: integer('date', { mode: 'timestamp' }),
  content: text('content'), // For notes
  title: text('title'), // For notes
  frequency: text('frequency'), // For recurring transactions
  startDate: integer('startDate', { mode: 'timestamp' }), // For recurring transactions
  endDate: integer('endDate', { mode: 'timestamp' }), // For recurring transactions
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// Blog posts
export const blogPosts = sqliteTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: text('featuredImage'),
  authorId: text('authorId').notNull(),
  authorName: text('authorName').notNull(),
  authorAvatar: text('authorAvatar'),
  category: text('category').notNull(),
  tags: text('tags'), // JSON array string
  metaTitle: text('metaTitle'),
  metaDescription: text('metaDescription'),
  metaKeywords: text('metaKeywords'), // JSON array string
  status: text('status').default('draft'), // draft, published, archived
  featured: integer('featured', { mode: 'boolean' }).default(false),
  viewCount: integer('viewCount').default(0),
  readingTime: integer('readingTime'), // in minutes
  publishedAt: integer('publishedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// Blog categories
export const blogCategories = sqliteTable('blog_categories', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  color: text('color').default('#10b981'),
  icon: text('icon').default('BookOpen'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});

// Blog analytics
export const blogAnalytics = sqliteTable('blog_analytics', {
  id: text('id').primaryKey(),
  postId: text('postId').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  referrer: text('referrer'),
  viewedAt: integer('viewedAt', { mode: 'timestamp' }).notNull(),
});

// Blog comments
export const blogComments = sqliteTable('blog_comments', {
  id: text('id').primaryKey(),
  postId: text('postId').notNull(),
  authorName: text('authorName').notNull(),
  authorEmail: text('authorEmail'),
  content: text('content').notNull(),
  parentId: text('parentId'),
  status: text('status').default('pending'), // pending, approved, rejected
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});

// Admin users
export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  userId: text('userId').unique().notNull(),
  role: text('role').default('admin'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// Investments
export const investments = sqliteTable('investments', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').notNull(), // crypto, stock, currency, etc.
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  buyPrice: real('buyPrice').notNull(),
  currentPrice: real('currentPrice'),
  currency: text('currency').default('USD'),
  buyDate: integer('buyDate', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// System Logs
export const systemLogs = sqliteTable('system_logs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'user_login', 'admin_action', 'api_request', 'error', 'security', 'performance'
  level: text('level').default('info'), // 'debug', 'info', 'warn', 'error', 'fatal'
  userId: text('userId'), // User ID if applicable
  adminId: text('adminId'), // Admin ID if applicable
  action: text('action').notNull(), // Action performed
  description: text('description'), // Detailed description
  metadata: text('metadata'), // JSON string for additional data
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  endpoint: text('endpoint'), // API endpoint for API requests
  method: text('method'), // HTTP method for API requests
  statusCode: integer('statusCode'), // HTTP status code for API requests
  responseTime: integer('responseTime'), // Response time in ms for performance logs
  error: text('error'), // Error message for error logs
  stackTrace: text('stackTrace'), // Stack trace for error logs
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
});

// Log Statistics for performance optimization
export const logStats = sqliteTable('log_stats', {
  id: text('id').primaryKey(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  logType: text('logType').notNull(), // 'user_login', 'admin_action', 'api_request', 'error', 'security', 'performance'
  totalCount: integer('totalCount').default(0),
  errorCount: integer('errorCount').default(0),
  avgResponseTime: real('avgResponseTime'), // Average response time for API requests
  uniqueUsers: integer('uniqueUsers'), // Unique users for the day
  metadata: text('metadata'), // JSON string for additional stats
});

// Export all tables
export const schema = {
  users,
  userProfiles,
  userData,
  blogPosts,
  blogCategories,
  blogAnalytics,
  blogComments,
  adminUsers,
  investments,
  systemLogs,
  logStats,
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserData = typeof userData.$inferSelect;
export type NewUserData = typeof userData.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;
export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type Investment = typeof investments.$inferSelect;
export type NewInvestment = typeof investments.$inferInsert;
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;