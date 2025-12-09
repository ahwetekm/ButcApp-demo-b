-- Supabase Tabloları Oluşturma Script'i
-- ButcApp Demo-b Projesi için

-- Users table for authentication
CREATE TABLE "users" (
    "id" text PRIMARY KEY NOT NULL,
    "email" text NOT NULL UNIQUE,
    "passwordHash" text NOT NULL,
    "fullName" text,
    "avatarUrl" text,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- User profile data
CREATE TABLE "user_profiles" (
    "id" text PRIMARY KEY NOT NULL,
    "userId" text NOT NULL UNIQUE,
    "email" text NOT NULL,
    "fullName" text,
    "avatarUrl" text,
    "cash" real DEFAULT 0,
    "bank" real DEFAULT 0,
    "savings" real DEFAULT 0,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- User financial data
CREATE TABLE "user_data" (
    "id" text PRIMARY KEY NOT NULL,
    "userId" text NOT NULL,
    "type" text NOT NULL, -- 'income', 'expense', 'recurring', 'note'
    "amount" real,
    "description" text,
    "category" text,
    "date" timestamp,
    "content" text, -- For notes
    "title" text, -- For notes
    "frequency" text, -- For recurring transactions
    "startDate" timestamp, -- For recurring transactions
    "endDate" timestamp, -- For recurring transactions
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Blog posts
CREATE TABLE "blog_posts" (
    "id" text PRIMARY KEY NOT NULL,
    "title" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "excerpt" text,
    "content" text NOT NULL,
    "featuredImage" text,
    "authorId" text NOT NULL,
    "authorName" text NOT NULL,
    "authorAvatar" text,
    "category" text NOT NULL,
    "tags" text, -- JSON array string
    "metaTitle" text,
    "metaDescription" text,
    "metaKeywords" text, -- JSON array string
    "status" text DEFAULT 'draft', -- draft, published, archived
    "featured" boolean DEFAULT false,
    "viewCount" integer DEFAULT 0,
    "readingTime" integer, -- in minutes
    "publishedAt" timestamp,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Blog categories
CREATE TABLE "blog_categories" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL UNIQUE,
    "slug" text NOT NULL UNIQUE,
    "description" text,
    "color" text DEFAULT '#10b981',
    "icon" text DEFAULT 'BookOpen',
    "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Blog analytics
CREATE TABLE "blog_analytics" (
    "id" text PRIMARY KEY NOT NULL,
    "postId" text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "referrer" text,
    "viewedAt" timestamp DEFAULT now() NOT NULL
);

-- Blog comments
CREATE TABLE "blog_comments" (
    "id" text PRIMARY KEY NOT NULL,
    "postId" text NOT NULL,
    "authorName" text NOT NULL,
    "authorEmail" text,
    "content" text NOT NULL,
    "parentId" text,
    "status" text DEFAULT 'pending', -- pending, approved, rejected
    "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Admin users
CREATE TABLE "admin_users" (
    "id" text PRIMARY KEY NOT NULL,
    "userId" text NOT NULL UNIQUE,
    "role" text DEFAULT 'admin',
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Investments
CREATE TABLE "investments" (
    "id" text PRIMARY KEY NOT NULL,
    "userId" text NOT NULL,
    "type" text NOT NULL, -- crypto, stock, currency, etc.
    "symbol" text NOT NULL,
    "name" text NOT NULL,
    "amount" real NOT NULL,
    "buyPrice" real NOT NULL,
    "currentPrice" real,
    "currency" text DEFAULT 'USD',
    "buyDate" timestamp NOT NULL,
    "notes" text,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- System Logs
CREATE TABLE "system_logs" (
    "id" text PRIMARY KEY NOT NULL,
    "type" text NOT NULL, -- 'user_login', 'admin_action', 'api_request', 'error', 'security', 'performance'
    "level" text DEFAULT 'info', -- 'debug', 'info', 'warn', 'error', 'fatal'
    "userId" text, -- User ID if applicable
    "adminId" text, -- Admin ID if applicable
    "action" text NOT NULL, -- Action performed
    "description" text, -- Detailed description
    "metadata" text, -- JSON string for additional data
    "ipAddress" text,
    "userAgent" text,
    "endpoint" text, -- API endpoint for API requests
    "method" text, -- HTTP method for API requests
    "statusCode" integer, -- HTTP status code for API requests
    "responseTime" integer, -- Response time in ms for performance logs
    "error" text, -- Error message for error logs
    "stackTrace" text, -- Stack trace for error logs
    "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Log Statistics for performance optimization
CREATE TABLE "log_stats" (
    "id" text PRIMARY KEY NOT NULL,
    "date" timestamp NOT NULL,
    "logType" text NOT NULL, -- 'user_login', 'admin_action', 'api_request', 'error', 'security', 'performance'
    "totalCount" integer DEFAULT 0,
    "errorCount" integer DEFAULT 0,
    "avgResponseTime" real, -- Average response time for API requests
    "uniqueUsers" integer, -- Unique users for the day
    "metadata" text -- JSON string for additional stats
);

-- İndeksler için performans optimizasyonu
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_userId ON user_profiles(userId);
CREATE INDEX idx_user_data_userId ON user_data(userId);
CREATE INDEX idx_user_data_type ON user_data(type);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_analytics_postId ON blog_analytics(postId);
CREATE INDEX idx_blog_comments_postId ON blog_comments(postId);
CREATE INDEX idx_admin_users_userId ON admin_users(userId);
CREATE INDEX idx_investments_userId ON investments(userId);
CREATE INDEX idx_system_logs_type ON system_logs(type);
CREATE INDEX idx_system_logs_createdAt ON system_logs(createdAt);
CREATE INDEX idx_log_stats_date ON log_stats(date);
CREATE INDEX idx_log_stats_logType ON log_stats(logType);