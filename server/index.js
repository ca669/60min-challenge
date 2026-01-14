const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup (SQLite)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'challenge.sqlite'),
    logging: false
});

// --- Models ---

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    token: {
        type: DataTypes.STRING, // 6-stelliger Code
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

const Entry = sequelize.define('Entry', {
    date: {
        type: DataTypes.STRING, // YYYY-MM-DD
        allowNull: false
    },
    username: { // Verknüpfung über Name statt ID für Einfachheit
        type: DataTypes.STRING,
        allowNull: false
    },
    journal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    meditation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    movement: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['date', 'username']
        }
    ]
});

// --- Helper Functions ---

function generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getTodayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

// --- API Routes ---

// Login
app.post('/api/login', async (req, res) => {
    const { username, token } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (user && user.token === token) {
            res.json({ success: true, username: user.username, isAdmin: user.isAdmin });
        } else {
            res.status(401).json({ error: 'Ungültiger Benutzername oder Code.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create User (Admin only)
app.post('/api/users', async (req, res) => {
    const { adminUsername, adminToken, newUsername } = req.body;

    try {
        // Admin Check
        const admin = await User.findOne({ where: { username: adminUsername, token: adminToken } });
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ error: 'Nur Administratoren können Nutzer anlegen.' });
        }

        const existingUser = await User.findOne({ where: { username: newUsername } });
        if (existingUser) {
            return res.status(400).json({ error: 'Benutzer existiert bereits.' });
        }

        const newToken = generateToken();
        const newUser = await User.create({
            username: newUsername,
            token: newToken,
            isAdmin: false
        });

        res.json({ username: newUser.username, token: newUser.token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all entries
app.get('/api/entries', async (req, res) => {
    try {
        const entries = await Entry.findAll({
            order: [['date', 'DESC']]
        });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or Update an entry
app.post('/api/entries', async (req, res) => {
    const { date, username, token, journal, meditation, movement } = req.body;

    if (!date || !username || !token) {
        return res.status(400).json({ error: 'Daten unvollständig.' });
    }

    // 1. Auth Check
    const user = await User.findOne({ where: { username } });
    if (!user || user.token !== token) {
        return res.status(401).json({ error: 'Authentifizierung fehlgeschlagen.' });
    }

    // 2. Date Check (Only allow today)
    const today = getTodayISO();
    if (date !== today) {
        return res.status(403).json({ error: 'Einträge können nur für den heutigen Tag bearbeitet werden.' });
    }

    try {
        // Check if entry exists
        let entry = await Entry.findOne({ where: { date, username } });

        if (entry) {
            // Update existing
            entry = await entry.update({ journal, meditation, movement });
        } else {
            // Create new
            entry = await Entry.create({ date, username, journal, meditation, movement });
        }

        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync Database and Start Server
sequelize.sync().then(async () => {
    console.log('Datenbank synchronisiert.');

    // Seed Admin User
    const adminUser = await User.findOne({ where: { username: 'Pascal' } });
    const initialToken = process.env.ADMIN_TOKEN || 'ABCDEF';

    if (!adminUser) {
        await User.create({
            username: 'Pascal',
            token: initialToken,
            isAdmin: true
        });
        console.log(`Admin User "Pascal" mit Token aus ENV erstellt.`);
    } else if (process.env.ADMIN_TOKEN && adminUser.token !== process.env.ADMIN_TOKEN) {
        // Optional: Update token if ENV changed
        await adminUser.update({ token: process.env.ADMIN_TOKEN });
        console.log('Admin Token wurde durch ENV aktualisiert.');
    }

    app.listen(PORT, () => {
        console.log(`Server läuft auf http://localhost:${PORT}`);
    });
});