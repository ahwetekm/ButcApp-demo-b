import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { schema } from './db/schema';
import path from 'path';

// Determine database path based on environment
const getDatabasePath = () => {
  // Check if DATABASE_URL is provided (VPS environment)
  if (process.env.DATABASE_URL) {
    // Extract path from DATABASE_URL (format: file:/path/to/db)
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl.startsWith('file:')) {
      const dbPath = dbUrl.substring(5); // Remove 'file:' prefix
      
      // For VPS, ensure directory exists and create if needed
      const dbDir = path.dirname(dbPath);
      try {
        require('fs').mkdirSync(dbDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, that's fine
      }
      
      return dbPath;
    }
    return dbUrl;
  }
  
  // Default local development path
  const localPath = path.join(process.cwd(), 'db', 'custom.db');
  
  // Ensure local db directory exists
  const localDir = path.dirname(localPath);
  try {
    require('fs').mkdirSync(localDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
  
  return localPath;
};

// Create database connection with error handling
let sqlite: Database.Database;

try {
  const dbPath = getDatabasePath();
  console.log('Connecting to database at:', dbPath);
  
  sqlite = new Database(dbPath);
  
  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON');
  
  console.log('Database connected successfully');
} catch (error) {
  console.error('Failed to connect to database:', error);
  
  // Fallback to local development database
  try {
    const fallbackPath = path.join(process.cwd(), 'db', 'custom.db');
    console.log('Attempting fallback to:', fallbackPath);
    
    const fs = require('fs');
    const fallbackDir = path.dirname(fallbackPath);
    fs.mkdirSync(fallbackDir, { recursive: true });
    
    sqlite = new Database(fallbackPath);
    sqlite.pragma('foreign_keys = ON');
    
    console.log('Fallback database connected successfully');
  } catch (fallbackError) {
    console.error('Fallback database connection failed:', fallbackError);
    throw fallbackError;
  }
}

// Export database instance with schema
export const db = drizzle(sqlite, { schema });

// Export the raw database instance for migrations
export const rawDb = sqlite;

// Export schema for easy access
export * from './db/schema';

// Helper function to close database connection
export const closeDb = () => {
  sqlite.close();
};