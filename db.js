require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: {
        // rejectUnauthorized: false
        ca: fs.readFileSync('./ca.crt').toString(),
    }
});

module.exports = pool;
