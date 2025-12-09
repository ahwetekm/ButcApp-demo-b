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
        console.log('Database directory created/verified:', dbDir);
      } catch (error) {
        console.log('Database directory already exists:', dbDir);
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
  console.log('=== DATABASE CONNECTION DEBUG ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL);
  console.log('Resolved Path:', dbPath);
  console.log('Current Working Directory:', process.cwd());
  
  // Check if database file exists
  const fs = require('fs');
  const dbExists = fs.existsSync(dbPath);
  console.log('Database file exists:', dbExists);
  
  if (!dbExists) {
    console.log('Database file does not exist, will be created automatically');
  }
  
  sqlite = new Database(dbPath);
  
  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON');
  
  // Test database connection
  try {
    const testResult = sqlite.prepare('SELECT 1 as test').get();
    console.log('Database test query successful:', testResult);
  } catch (testError) {
    console.error('Database test query failed:', testError);
  }
  
  console.log('Database connected successfully');
  console.log('=== END DATABASE DEBUG ===');
} catch (error) {
  console.error('=== DATABASE CONNECTION ERROR ===');
  console.error('Error:', error);
  console.error('Error message:', (error as Error).message);
  console.error('Error stack:', (error as Error).stack);
  console.error('=== END DATABASE ERROR ===');
  
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