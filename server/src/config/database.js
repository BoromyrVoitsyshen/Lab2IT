const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Debug log to verify env vars are loaded (don't log the actual password in production, but helpful here)
console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    passwordLength: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'notes_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
})();

module.exports = pool;
