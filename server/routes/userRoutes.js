const express = require('express');
const router = express.Router();
const { User } = require('../models');

function generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Get all users (public)
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['username', 'isAdmin']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create User (Admin only)
router.post('/users', async (req, res) => {
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

module.exports = router;
