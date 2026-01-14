import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Toast Component
const Toast = ({ message, title, type, onClose }) => {
    return (
        <div className={`toast ${type || 'info'}`}>
            <div className="toast-content">
                {title && <span className="toast-title">{title}</span>}
                <span>{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>
                &times;
            </button>
        </div>
    );
};

function App() {
    // Auth State
    const [user, setUser] = useState(null);
    const [loginUser, setLoginUser] = useState('');
    const [loginToken, setLoginToken] = useState('');
    const [loginError, setLoginError] = useState('');

    // Data State
    const [entries, setEntries] = useState([]);

    // Hilfsfunktion für Berliner Datum (YYYY-MM-DD)
    const getTodayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

    const [formData, setFormData] = useState({
        date: getTodayISO(),
        journal: false,
        meditation: false,
        movement: false
    });

    // Admin State
    const [newUser, setNewUser] = useState('');

    // UI State
    const [toasts, setToasts] = useState([]); // Array of { id, title, message, type }

    // (getTodayISO nach oben verschoben)

    const addToast = (title, message, type = 'info') => {
        let id;
        setToasts((prev) => {
            id = Date.now();
            return [...prev, { id, title, message, type }];
        });

        // Auto remove normal info/success messages after 5s, but keep "new user" (important) longer or manual
        if (type !== 'manual-close') {
            setTimeout(() => {
                removeToast(id);
            }, 5000);
        }
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const fetchEntries = async () => {
        try {
            const response = await axios.get('/api/entries');
            setEntries(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Einträge:', error);
        }
    };

    useEffect(() => {
        const loadEntries = async () => {
            await fetchEntries();
        };
        loadEntries();
    }, []);

    // --- Auth Handlers ---

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const res = await axios.post('/api/login', {
                username: loginUser,
                token: loginToken
            });
            if (res.data.success) {
                setUser({
                    username: res.data.username,
                    isAdmin: res.data.isAdmin,
                    token: loginToken
                });
            }
        } catch {
            setLoginError('Login fehlgeschlagen. Bitte Name und Code prüfen.');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setLoginToken('');
        setLoginUser('');
    };

    // --- Entry Handlers ---

    const handleEntryChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEntrySubmit = async (e) => {
        e.preventDefault();

        if (formData.date !== getTodayISO()) {
            addToast('Fehler', 'Du kannst nur den heutigen Tag bearbeiten!', 'error');
            return;
        }

        try {
            await axios.post('/api/entries', {
                ...formData,

                username: user.username,

                token: user.token
            });
            await fetchEntries();
            addToast('Erfolg', 'Eintrag erfolgreich gespeichert!', 'success');
        } catch (error) {
            console.error('Fehler:', error);
            addToast('Fehler', error.response?.data?.error || 'Speichern fehlgeschlagen', 'error');
        }
    };

    // --- Admin Handlers ---

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUser.trim()) return;

        try {
            const res = await axios.post('/api/users', {
                adminUsername: user.username,
                adminToken: user.token,
                newUsername: newUser
            });

            // Show persistent toast with credentials
            addToast(
                'Benutzer erstellt!',
                `Name: ${res.data.username} | Code: ${res.data.token}`,
                'success manual-close' // Use 'success' style but prevent auto-close if logic allows, actually I used type for style
            );

            console.log('Neuer Benutzer:', res.data);

            setNewUser('');
        } catch (error) {
            addToast(
                'Fehler',
                'Fehler beim Anlegen: ' + (error.response?.data?.error || error.message),
                'error'
            );
        }
    };

    // Helper to determine toast class
    const getToastClass = (type) => {
        if (type === 'success' || type.includes('success')) return 'success';
        if (type === 'error') return 'error';
        return '';
    };

    // --- Helpers ---
    const getProgress = (entry) => {
        let count = 0;
        if (entry.journal) count++;
        if (entry.meditation) count++;
        if (entry.movement) count++;
        return Math.round((count / 3) * 100);
    };

    const isToday = (dateString) => dateString === getTodayISO();

    // --- Render ---

    if (!user) {
        return (
            <div className="container">
                <h1>60-Minuten Challenge</h1>
                <div className="card">
                    <h2>Anmelden</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Benutzername:</label>
                            <input
                                type="text"
                                value={loginUser}
                                onChange={(e) => setLoginUser(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Code (6 Buchstaben):</label>
                            <input
                                type="text"
                                value={loginToken}
                                onChange={(e) => setLoginToken(e.target.value.toUpperCase())}
                                maxLength={6}
                                required
                            />
                        </div>
                        {loginError && <p className="error">{loginError}</p>}
                        <button type="submit">Starten</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="header">
                <h1>Hallo, {user.username}! 👋</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Abmelden
                </button>
            </div>

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        title={t.title}
                        message={t.message}
                        type={getToastClass(t.type)}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>

            {/* Admin Panel */}
            {user.isAdmin && (
                <div className="card admin-card">
                    <h2>👥 Neuen Teilnehmer einladen</h2>
                    <form onSubmit={handleCreateUser}>
                        <div className="admin-input-group">
                            <input
                                type="text"
                                placeholder="Name des Freundes"
                                value={newUser}
                                onChange={(e) => setNewUser(e.target.value)}
                                required
                            />
                            <button type="submit">Hinzufügen</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Daily Check-in */}
            <div className="card form-card">
                <h2>Täglicher Check-in</h2>
                <form onSubmit={handleEntrySubmit}>
                    <div className="form-group">
                        <label>Datum:</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleEntryChange}
                            max={getTodayISO()}
                            disabled
                        />
                        {!isToday(formData.date) && (
                            <small style={{ color: 'red' }}>
                                Nur der heutige Tag ({getTodayISO()}) kann bearbeitet werden.
                            </small>
                        )}
                    </div>

                    <div className="checkbox-group">
                        <label
                            className={`checkbox-label ${
                                !isToday(formData.date) ? 'disabled' : ''
                            }`}
                        >
                            <input
                                type="checkbox"
                                name="journal"
                                checked={formData.journal}
                                onChange={handleEntryChange}
                                disabled={!isToday(formData.date)}
                            />
                            <span>📝 10min Tagebuch</span>
                        </label>

                        <label
                            className={`checkbox-label ${
                                !isToday(formData.date) ? 'disabled' : ''
                            }`}
                        >
                            <input
                                type="checkbox"
                                name="meditation"
                                checked={formData.meditation}
                                onChange={handleEntryChange}
                                disabled={!isToday(formData.date)}
                            />
                            <span>🧘 10min Meditation</span>
                        </label>

                        <label
                            className={`checkbox-label ${
                                !isToday(formData.date) ? 'disabled' : ''
                            }`}
                        >
                            <input
                                type="checkbox"
                                name="movement"
                                checked={formData.movement}
                                onChange={handleEntryChange}
                                disabled={!isToday(formData.date)}
                            />
                            <span>🏃 40min Bewegung</span>
                        </label>
                    </div>

                    {isToday(formData.date) ? (
                        <button type="submit">Speichern</button>
                    ) : (
                        <button disabled style={{ backgroundColor: '#ccc', cursor: 'not-allowed' }}>
                            Bearbeiten gesperrt
                        </button>
                    )}
                </form>
            </div>

            {/* History */}
            <div className="card history-card">
                <h2>Gruppen-Historie</h2>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Name</th>
                                <th>📝</th>
                                <th>🧘</th>
                                <th>🏃</th>
                                <th>Fortschritt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, idx) => (
                                <tr
                                    key={idx}
                                    className={entry.username === user.username ? 'my-entry' : ''}
                                >
                                    <td>{entry.date}</td>
                                    <td>{entry.username}</td>
                                    <td>{entry.journal ? '✅' : '❌'}</td>
                                    <td>{entry.meditation ? '✅' : '❌'}</td>
                                    <td>{entry.movement ? '✅' : '❌'}</td>
                                    <td>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${getProgress(entry)}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default App;
