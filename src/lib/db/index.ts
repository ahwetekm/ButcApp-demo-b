import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { schema } from './schema';
import path from 'path';

// Create database connection
const sqlite = new Database(path.join(process.cwd(), 'db', 'custom.db'));

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Export database instance with schema
export const db = drizzle(sqlite, { schema });

// Export the raw database instance for migrations
export const rawDb = sqlite;

// Export schema for easy access
export * from './schema';

// Helper function to close database connection
export const closeDb = () => {
  sqlite.close();
};