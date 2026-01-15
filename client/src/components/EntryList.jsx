import React, { useState } from 'react';
import { Card, Table, Progress, Title, Group, ActionIcon, Text, ScrollArea } from '@mantine/core';
import { IconCheck, IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/de';

dayjs.locale('de');

const EntryList = ({ entries, allUsers, currentUsername }) => {
    // Default to today
    const [currentDate, setCurrentDate] = useState(dayjs());

    const handlePrevDay = () => setCurrentDate((d) => d.subtract(1, 'day'));
    const handleNextDay = () => setCurrentDate((d) => d.add(1, 'day'));

    const formattedDate = currentDate.format('YYYY-MM-DD');
    const displayDate = currentDate.format('DD. MMMM YYYY');

    // Filter entries for the selected date
    const entriesForDate = entries.filter((e) => e.date === formattedDate);

    // Map all users to rows
    const rows = allUsers.map((user) => {
        // Find entry for this user on this date
        const entry = entriesForDate.find((e) => e.username === user.username);
        const isMyEntry = user.username === currentUsername;

        // Default values if no entry exists
        const journal = entry ? entry.journal : false;
        const meditation = entry ? entry.meditation : false;
        const movement = entry ? entry.movement : false;

        // Calculate progress
        let count = 0;
        if (journal) count++;
        if (meditation) count++;
        if (movement) count++;
        const progress = Math.round((count / 3) * 100);

        return (
            <Table.Tr key={user.username} bg={isMyEntry ? 'blue.0' : undefined}>
                <Table.Td>
                    <Text fw={500}>{user.username}</Text>
                </Table.Td>
                <Table.Td>
                    {journal ? (
                        <IconCheck size={20} color="green" />
                    ) : (
                        <IconX size={20} color="gray" />
                    )}
                </Table.Td>
                <Table.Td>
                    {meditation ? (
                        <IconCheck size={20} color="green" />
                    ) : (
                        <IconX size={20} color="gray" />
                    )}
                </Table.Td>
                <Table.Td>
                    {movement ? (
                        <IconCheck size={20} color="green" />
                    ) : (
                        <IconX size={20} color="gray" />
                    )}
                </Table.Td>
                <Table.Td>
                    <Progress value={progress} color="blue" size="sm" />
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
                <Title order={2} size="h3">
                    Gruppen-Historie
                </Title>

                {/* Date Pagination Controls */}
                <Group gap="xs" w="100%" justify="center">
                    <ActionIcon variant="subtle" onClick={handlePrevDay}>
                        <IconChevronLeft size={20} />
                    </ActionIcon>
                    <Text fw={700} style={{ minWidth: '140px', textAlign: 'center' }}>
                        {displayDate}
                    </Text>
                    <ActionIcon
                        variant="subtle"
                        onClick={handleNextDay}
                        disabled={currentDate.isSame(dayjs(), 'day')}
                    >
                        <IconChevronRight size={20} />
                    </ActionIcon>
                </Group>
            </Group>

            <ScrollArea>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>📝</Table.Th>
                            <Table.Th>🧘</Table.Th>
                            <Table.Th>🏃</Table.Th>
                            <Table.Th>Fortschritt</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </ScrollArea>
        </Card>
    );
};

export default EntryList;
