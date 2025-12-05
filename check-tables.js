import { query } from './src/lib/db-simple.js'

async function checkTables() {
  try {
    console.log('Checking database tables...')
    
    // Get all tables
    const tables = await query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `)
    
    console.log('Tables found:', tables.map(t => t.name))
    
    // Check if admins table exists
    const adminTables = tables.filter(t => t.name.toLowerCase().includes('admin'))
    console.log('Admin-related tables:', adminTables.map(t => t.name))
    
    // Check structure of admin tables
    for (const table of adminTables) {
      console.log(`\nStructure of ${table.name}:`)
      const columns = await query(`PRAGMA table_info(${table.name})`)
      console.log(columns.map(c => `${c.name}: ${c.type}`))
    }
    
  } catch (error) {
    console.error('Database error:', error)
  } finally {
    process.exit(0)
  }
}

checkTables()