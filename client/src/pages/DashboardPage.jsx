import React from 'react';
import { Container, Button, Group, Title, Stack, ActionIcon } from '@mantine/core';
import AdminPanel from '../components/AdminPanel';
import EntryForm from '../components/EntryForm';
import EntryList from '../components/EntryList';
import { IconLogout } from '@tabler/icons-react';

const DashboardPage = ({
    user,
    onLogout,
    handleAddUser,
    formData,
    setFormData,
    handleEntrySubmit,
    entries,
    allUsers,
    isToday
}) => {
    return (
        <Container size="md" py="xl">
            <Group justify="space-between" mb="xl">
                <Title order={1}>Hallo, {user.username}! 👋</Title>
                <ActionIcon color="red" onClick={onLogout}>
                    <IconLogout size={20} />
                </ActionIcon>
            </Group>

            <Stack gap="lg">
                {/* Admin Panel */}
                {user.isAdmin && <AdminPanel onAddUser={handleAddUser} />}

                {/* Daily Check-in */}
                <EntryForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleEntrySubmit}
                    isToday={isToday}
                />

                {/* History */}
                <EntryList entries={entries} allUsers={allUsers} currentUsername={user.username} />
            </Stack>
        </Container>
    );
};

export default DashboardPage;
