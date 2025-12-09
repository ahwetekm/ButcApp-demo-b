import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';

// Users table for authentication
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordhash: text('passwordhash').notNull(),
  fullname: text('fullname'),
  avatarurl: text('avatarurl'),
  createdat: timestamp('createdat').defaultNow().notNull(),
  updatedat: timestamp('updatedat').defaultNow().notNull(),
});

// User profile data
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  userid: text('userid').unique().notNull(),
  email: text('email').notNull(),
  fullname: text('fullname'),
  avatarurl: text('avatarurl'),
  cash: real('cash').default(0),
  bank: real('bank').default(0),
  savings: real('savings').default(0),
  createdat: timestamp('createdat').defaultNow().notNull(),
  updatedat: timestamp('updatedat').defaultNow().notNull(),
});

// User financial data
export const userData = pgTable('user_data', {
  id: text('id').primaryKey(),
  userid: text('userid').notNull(),
  type: text('type').notNull(), // 'income', 'expense', 'recurring', 'note'
  amount: real('amount'),
  description: text('description'),
  category: text('category'),
  date: timestamp('date'),
  content: text('content'), // For notes
  title: text('title'), // For notes
  frequency: text('frequency'), // For recurring transactions
  startdate: timestamp('startdate'), // For recurring transactions
  enddate: timestamp('enddate'), // For recurring transactions
  createdat: timestamp('createdat').defaultNow().notNull(),
  updatedat: timestamp('updatedat').defaultNow().notNull(),
});

// Blog posts
export const blogPosts = pgTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredimage: text('featuredimage'),
  authorid: text('authorid').notNull(),
  authorname: text('authorname').notNull(),
  authoravatar: text('authoravatar'),
  category: text('category').notNull(),
  tags: text('tags'), // JSON array string
  metatitle: text('metatitle'),
  metadescription: text('metadescription'),
  metakeywords: text('metakeywords'), // JSON array string
  status: text('status').default('draft'), // draft, published, archived
  featured: boolean('featured').default(false),
  viewcount: integer('viewcount').default(0),
  readingtime: integer('readingtime'), // in minutes
  publishedat: timestamp('publishedat'),
  createdat: timestamp('createdat').defaultNow().notNull(),
  updatedat: timestamp('updatedat').defaultNow().notNull(),
});

// Blog categories
export const blogCategories = pgTable('blog_categories', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  color: text('color').default('#10b981'),
  icon: text('icon').default('BookOpen'),
  createdat: timestamp('createdat').defaultNow().notNull(),
});

// Blog analytics
export const blogAnalytics = pgTable('blog_analytics', {
  id: text('id').primaryKey(),
  postid: text('postid').notNull(),
  ipaddress: text('ipaddress'),
  useragent: text('useragent'),
  referrer: text('referrer'),
  viewedat: timestamp('viewedat').defaultNow().notNull(),
});

// Blog comments
export const blogComments = pgTable('blog_comments', {
  id: text('id').primaryKey(),
  postid: text('postid').notNull(),
  authorname: text('authorname').notNull(),
  authoremail: text('authoremail'),
  content: text('content').notNull(),
  parentid: text('parentid'),
  status: text('status').default('pending'), // pending, approved, rejected
  createdat: timestamp('createdat').defaultNow().notNull(),
});

// Admin users
export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  userid: text('userid').unique().notNull(),
  role: text('role').default('admin'),
  createdat: timestamp('createdat').defaultNow().notNull(),
  updatedat: timestamp('updatedat').defaultNow().notNull(),
});

// Investments
export const investments = pgTable('investments', {
  id: text('id').primaryKey(),
  userid: text('userid').notNull(),
  type: text('type').notNull(), // crypto, stock, currency, etc.
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  buyprice: real('buyprice').notNull(),
  currentprice: real('currentprice'),
  currency: text('currency').default('USD'),
  buydate: timestamp('buydate').notNull(),
  notes: text('notes'),
  createdat: timestamp('createdat').defaultNow().notNull(),
  updatedat: timestamp('updatedat').defaultNow().notNull(),
});

// System Logs
export const systemLogs = pgTable('system_logs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'user_login', 'admin_action', 'api_request', 'error', 'security', 'performance'
  level: text('level').default('info'), // 'debug', 'info', 'warn', 'error', 'fatal'
  userid: text('userid'), // User ID if applicable
  adminid: text('adminid'), // Admin ID if applicable
  action: text('action').notNull(), // Action performed
  description: text('description'), // Detailed description
  metadata: text('metadata'), // JSON string for additional data
  ipaddress: text('ipaddress'),
  useragent: text('useragent'),
  endpoint: text('endpoint'), // API endpoint for API requests
  method: text('method'), // HTTP method for API requests
  statuscode: integer('statuscode'), // HTTP status code for API requests
  responsetime: integer('responsetime'), // Response time in ms for performance logs
  error: text('error'), // Error message for error logs
  stacktrace: text('stacktrace'), // Stack trace for error logs
  createdat: timestamp('createdat').defaultNow().notNull(),
});

// Log Statistics for performance optimization
export const logStats = pgTable('log_stats', {
  id: text('id').primaryKey(),
  date: timestamp('date').notNull(),
  logtype: text('logtype').notNull(), // 'user_login', 'admin_action', 'api_request', 'error', 'security', 'performance'
  totalcount: integer('totalcount').default(0),
  errorcount: integer('errorcount').default(0),
  avgresponsetime: real('avgresponsetime'), // Average response time for API requests
  uniqueusers: integer('uniqueusers'), // Unique users for day
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