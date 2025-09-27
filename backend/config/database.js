const mysql = require('mysql2');
require('dotenv').config({ path: './config.env' });

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'image_gallery',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Initialize database
const initDatabase = async () => {
  try {
    // Create database if it doesn't exist
    await promisePool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'image_gallery'}`);
    
    // Create images table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        caption TEXT NOT NULL,
        uploader_name VARCHAR(100) NOT NULL,
        roll_number VARCHAR(20) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        approved_by VARCHAR(100) NULL,
        rejection_reason TEXT NULL,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_roll_number (roll_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create users table with roles
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'student') DEFAULT 'student',
        roll_number VARCHAR(20) NULL,
        full_name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NULL,
        year VARCHAR(10) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_role (role),
        INDEX idx_roll_number (roll_number),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create assignments table
    await promisePool.execute(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        due_date DATETIME NULL,
        max_images INT DEFAULT 1,
        compress_images BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_is_active (is_active),
        INDEX idx_created_by (created_by),
        INDEX idx_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Update images table to include assignment_id
    await promisePool.execute(`
      ALTER TABLE images 
      ADD COLUMN IF NOT EXISTS assignment_id INT NULL,
      ADD FOREIGN KEY IF NOT EXISTS fk_assignment (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
      ADD INDEX IF NOT EXISTS idx_assignment_id (assignment_id)
    `);

    // Add compress_images column to assignments table
    await promisePool.execute(`
      ALTER TABLE assignments 
      ADD COLUMN IF NOT EXISTS compress_images BOOLEAN DEFAULT TRUE
    `);

    // Insert default admin if not exists
    const [adminExists] = await promisePool.execute(
      'SELECT id FROM users WHERE username = ? AND role = "admin"',
      [process.env.ADMIN_USERNAME || 'admin']
    );

    if (adminExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      
      // Create admin user in users table
      await promisePool.execute(
        'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)',
        [
          process.env.ADMIN_USERNAME || 'admin', 
          process.env.ADMIN_EMAIL || 'admin@example.com',
          hashedPassword, 
          'admin',
          'System Administrator'
        ]
      );
      
      console.log('✅ Default admin created');
    }

    // Check if admin exists in admins table for backward compatibility
    const [legacyAdminExists] = await promisePool.execute(
      'SELECT id FROM admins WHERE username = ?',
      [process.env.ADMIN_USERNAME || 'admin']
    );

    if (legacyAdminExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      
      // Also create in admins table for backward compatibility
      await promisePool.execute(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        [process.env.ADMIN_USERNAME || 'admin', hashedPassword]
      );
      
      console.log('✅ Legacy admin created');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  pool: promisePool,
  initDatabase
};
