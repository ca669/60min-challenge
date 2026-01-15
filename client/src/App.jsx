import { useState, useEffect, use } from 'react';
import { notifications } from '@mantine/notifications';
import {
    loginUser,
    logoutUser,
    getStoredSession,
    getEntries,
    saveEntry,
    createNewUser,
    getAllUsers
} from './services/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Helper function moved outside component
const getTodayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

function App() {
    // Auth State
    const [user, setUser] = useState(null);
    const [loginError, setLoginError] = useState('');

    // Data State
    const [entries, setEntries] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const [formData, setFormData] = useState({
        date: getTodayISO(),
        journal: false,
        meditation: false,
        movement: false
    });

    const fetchAllData = async () => {
        try {
            const [entriesData, usersData] = await Promise.all([getEntries(), getAllUsers()]);
            setEntries(entriesData);
            setAllUsers(usersData);
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            notifications.show({
                title: 'Fehler',
                message: 'Konnte Daten nicht laden',
                color: 'red'
            });
        }
    };

    useEffect(() => {
        // Try to restore session on mount
        const storedSession = getStoredSession();
        if (storedSession) {
            setUser(storedSession);
        }

        // Fetch data
        fetchAllData();
    }, []);

    useEffect(() => {
        const userEntry = entries.find(
            (e) => e.username === user?.username && e.date === getTodayISO()
        );
        if (userEntry) {
            setFormData({
                date: userEntry.date,
                journal: userEntry.journal,
                meditation: userEntry.meditation,
                movement: userEntry.movement
            });
        }
    }, [entries]);

    // --- Auth Handlers ---

    const handleLogin = async (username, token) => {
        setLoginError('');
        try {
            const data = await loginUser(username, token);
            if (data.success) {
                // loginUser service now returns the full user object including token
                setUser({
                    username: data.username,
                    isAdmin: data.isAdmin,
                    token: data.token
                });
            }
        } catch {
            setLoginError('Login fehlgeschlagen. Bitte Name und Code prüfen.');
        }
    };

    const handleLogout = () => {
        logoutUser();
        setUser(null);
    };

    // --- Entry Handlers ---

    const handleEntrySubmit = async (e) => {
        e.preventDefault();

        if (formData.date !== getTodayISO()) {
            notifications.show({
                title: 'Fehler',
                message: 'Du kannst nur den heutigen Tag bearbeiten!',
                color: 'red'
            });
            return;
        }

        try {
            await saveEntry({
                ...formData,
                username: user.username,
                token: user.token
            });
            await fetchAllData();
            notifications.show({
                title: 'Erfolg',
                message: 'Eintrag erfolgreich gespeichert!',
                color: 'green'
            });
        } catch (error) {
            console.error('Fehler:', error);
            notifications.show({
                title: 'Fehler',
                message: error.response?.data?.error || 'Speichern fehlgeschlagen',
                color: 'red'
            });
        }
    };

    // --- Admin Handlers ---

    const handleCreateUser = async (newUsername) => {
        if (!newUsername.trim()) return;

        try {
            const data = await createNewUser({
                adminUsername: user.username,
                adminToken: user.token,
                newUsername: newUsername
            });

            notifications.show({
                title: 'Benutzer erstellt!',
                message: `Name: ${data.username} | Code: ${data.token}`,
                color: 'green',
                autoClose: false // Keep open so they can copy the code
            });
        } catch (error) {
            notifications.show({
                title: 'Fehler',
                message: 'Fehler beim Anlegen: ' + (error.response?.data?.error || error.message),
                color: 'red'
            });
        }
    };

    const isToday = (dateString) => dateString === getTodayISO();

    // --- Render ---

    if (!user) {
        return <LoginPage onLogin={handleLogin} loginError={loginError} />;
    }

    return (
        <DashboardPage
            user={user}
            onLogout={handleLogout}
            handleAddUser={handleCreateUser}
            formData={formData}
            setFormData={setFormData}
            handleEntrySubmit={handleEntrySubmit}
            entries={entries}
            allUsers={allUsers}
            isToday={isToday}
        />
    );
}

export default App;
