const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, User } = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const entryRoutes = require('./routes/entryRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', entryRoutes);

// Sync Database and Start Server
// We use sync() here to ensure connection, but ideally migrations manage schema
sequelize.sync().then(async () => {
    console.log('Datenbank synchronisiert.');

    // Seed Admin User
    try {
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
    } catch (e) {
        console.error("Error seeding admin user:", e);
    }

    app.listen(PORT, () => {
        console.log(`Server läuft auf http://localhost:${PORT}`);
    });
});
