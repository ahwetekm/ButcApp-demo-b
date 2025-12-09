CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"role" text DEFAULT 'admin',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "blog_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"postId" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"referrer" text,
	"viewedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#10b981',
	"icon" text DEFAULT 'BookOpen',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"postId" text NOT NULL,
	"authorName" text NOT NULL,
	"authorEmail" text,
	"content" text NOT NULL,
	"parentId" text,
	"status" text DEFAULT 'pending',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featuredImage" text,
	"authorId" text NOT NULL,
	"authorName" text NOT NULL,
	"authorAvatar" text,
	"category" text NOT NULL,
	"tags" text,
	"metaTitle" text,
	"metaDescription" text,
	"metaKeywords" text,
	"status" text DEFAULT 'draft',
	"featured" boolean DEFAULT false,
	"viewCount" integer DEFAULT 0,
	"readingTime" integer,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "log_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"logType" text NOT NULL,
	"totalCount" integer DEFAULT 0,
	"errorCount" integer DEFAULT 0,
	"avgResponseTime" real,
	"uniqueUsers" integer,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"level" text DEFAULT 'info',
	"userId" text,
	"adminId" text,
	"action" text NOT NULL,
	"description" text,
	"metadata" text,
	"ipAddress" text,
	"userAgent" text,
	"endpoint" text,
	"method" text,
	"statusCode" integer,
	"responseTime" integer,
	"error" text,
	"stackTrace" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_data" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"amount" real,
	"description" text,
	"category" text,
	"date" timestamp,
	"content" text,
	"title" text,
	"frequency" text,
	"startDate" timestamp,
	"endDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"email" text NOT NULL,
	"fullName" text,
	"avatarUrl" text,
	"cash" real DEFAULT 0,
	"bank" real DEFAULT 0,
	"savings" real DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"fullName" text,
	"avatarUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
