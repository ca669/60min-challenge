const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Login
router.post('/login', async (req, res) => {
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

module.exports = router;
