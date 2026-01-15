import React from 'react';
import LoginForm from '../components/LoginForm';
import { Container, Title } from '@mantine/core';

const LoginPage = ({ onLogin, loginError }) => {
    return (
        <Container>
             {/* Title is already inside LoginForm for better centering, but we can keep a main app title if needed. 
                 For now, LoginForm is self-contained. */}
            <LoginForm onLogin={onLogin} error={loginError} />
        </Container>
    );
};

export default LoginPage;