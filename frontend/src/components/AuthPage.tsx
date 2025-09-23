import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import CorsErrorPanel from './CorsErrorPanel';
import { useAuth } from '../contexts/AuthContext';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { corsError } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 500 }}>
        {corsError && <CorsErrorPanel />}
        
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </Stack>
    </Box>
  );
}

export default AuthPage;
