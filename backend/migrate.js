#!/usr/bin/env node
/**
 * Migration Script: Add image_urls column to rooms table
 * Run with: node migrate.js
 */

const db = require('./config/db');

async function migrate() {
  try {
    console.log('📝 Starting migration...');
    
    // Check if column exists
    const [columns] = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='rooms' AND COLUMN_NAME='image_urls'"
    );
    
    if (columns.length > 0) {
      console.log('✅ Column image_urls already exists');
      process.exit(0);
    }
    
    // Add column
    console.log('🔧 Adding image_urls column to rooms table...');
    await db.query(
      `ALTER TABLE rooms ADD COLUMN image_urls JSON DEFAULT NULL AFTER image_url`
    );
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
