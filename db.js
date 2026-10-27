// =====================================================================
// Database Connection Pool Module
// Driver: mysql2/promise
// =====================================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_sms_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    // Enable multiple statements to allow calling Stored Procedures that return multiple result sets
    multipleStatements: true,
    timezone: 'Z',
    dateStrings: true
});

// Test connection on application boot
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`[Database] Connected successfully to MySQL (${process.env.DB_NAME || 'college_sms_db'} at ${process.env.DB_HOST || 'localhost'})`);
        connection.release();
    } catch (err) {
        console.error('[Database] Connection Failed:', err.message);
        console.warn('[Database] Ensure MySQL server is running and .env credentials are correct.');
    }
})();

module.exports = pool;
