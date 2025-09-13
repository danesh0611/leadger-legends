// Basic Express server setup for signup API
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());



// MySQL config (from .env)
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

app.post('/api/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const conn = await mysql.createConnection(dbConfig);
        await conn.execute(
            'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, role]
        );
        await conn.end();
        res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute(
            'SELECT * FROM Users WHERE email = ? AND password = ? AND role = ?',
            [email, password, role]
        );
        await conn.end();
        if (rows.length > 0) {
            // User found, login successful
            res.status(200).json({ message: 'Login successful', user: rows[0] });
        } else {
            res.status(401).json({ error: 'Invalid email, password, or role' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
