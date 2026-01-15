const express = require('express');
const router = express.Router();
const { User, Entry } = require('../models');

function getTodayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

// Get all entries
router.get('/entries', async (req, res) => {
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
router.post('/entries', async (req, res) => {
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

module.exports = router;
