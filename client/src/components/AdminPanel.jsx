import React, { useState } from 'react';
import { Card, Title, TextInput, Button, Group } from '@mantine/core';

const AdminPanel = ({ onAddUser }) => {
    const [newUser, setNewUser] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddUser(newUser);
        setNewUser('');
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder bg="var(--mantine-color-gray-0)">
            <Title order={2} size="h3" mb="md">
                👥 Neuen Teilnehmer einladen
            </Title>
            <form onSubmit={handleSubmit}>
                <Group align="flex-end">
                    <TextInput
                        label="Name des Freundes"
                        placeholder="Name"
                        value={newUser}
                        onChange={(e) => setNewUser(e.target.value)}
                        required
                        style={{ flex: 1 }}
                    />
                    <Button type="submit">Hinzufügen</Button>
                </Group>
            </form>
        </Card>
    );
};

export default AdminPanel;
