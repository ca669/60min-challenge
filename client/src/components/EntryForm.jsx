import { Card, Checkbox, Button, Title, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';

const EntryForm = ({ formData, setFormData, onSubmit, isToday }) => {
    // Handle Date Change specifically for DateInput
    const handleDateChange = (date) => {
        // Format to YYYY-MM-DD for consistency with backend
        const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';
        setFormData((prev) => ({ ...prev, date: formattedDate }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked
        }));
    };

    const isDateToday = isToday(formData.date);
    const dateValue = formData.date ? new Date(formData.date) : null;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={2} size="h3" mb="md">
                Täglicher Check-in
            </Title>
            <form onSubmit={onSubmit}>
                <Stack>
                    <DateInput
                        value={dateValue}
                        onChange={handleDateChange}
                        label="Datum"
                        maxDate={new Date()}
                        disabled
                    />

                    <Checkbox
                        label="📝 10min Schritte / Tagebuch"
                        name="journal"
                        checked={formData.journal}
                        onChange={handleCheckboxChange}
                        disabled={!isDateToday}
                    />

                    <Checkbox
                        label="🧘 10min Meditation"
                        name="meditation"
                        checked={formData.meditation}
                        onChange={handleCheckboxChange}
                        disabled={!isDateToday}
                    />

                    <Checkbox
                        label="🏃 40min Bewegung"
                        name="movement"
                        checked={formData.movement}
                        onChange={handleCheckboxChange}
                        disabled={!isDateToday}
                    />

                    <Button type="submit" disabled={!isDateToday} mt="md">
                        Speichern
                    </Button>
                </Stack>
            </form>
        </Card>
    );
};

export default EntryForm;
