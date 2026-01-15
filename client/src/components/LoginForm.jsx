import React, { useState } from 'react';
import { Card, TextInput, Button, Group, Title, Container, Text } from '@mantine/core';

const LoginForm = ({ onLogin, error }) => {
    const [loginUser, setLoginUser] = useState('');
    const [loginToken, setLoginToken] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(loginUser, loginToken);
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center">60min-Challenge</Title>

            <Card withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Benutzername"
                        placeholder="Dein Name"
                        value={loginUser}
                        onChange={(e) => setLoginUser(e.target.value)}
                        required
                    />
                    <TextInput
                        label="Code (6 Buchstaben)"
                        placeholder="ABCDEF"
                        mt="md"
                        value={loginToken}
                        onChange={(e) => setLoginToken(e.target.value.toUpperCase())}
                        maxLength={6}
                        required
                    />
                    {error && (
                        <Text c="red" size="sm" mt="sm">
                            {error}
                        </Text>
                    )}
                    <Button fullWidth mt="xl" type="submit">
                        Starten
                    </Button>
                </form>
            </Card>
        </Container>
    );
};

export default LoginForm;
