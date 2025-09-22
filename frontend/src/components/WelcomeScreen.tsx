import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../contexts/AuthContext';

function WelcomeScreen() {
  const { user } = useAuth();

  useEffect(() => {
    // Автоматически скрываем экран приветствия через 2 секунды
    const timer = setTimeout(() => {
      // Компонент автоматически исчезнет благодаря логике в App.tsx
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getUserDisplayName = () => {
    if (!user) return 'Пользователь';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

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
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, maxWidth: 500, mx: 'auto', bgcolor: '#fff' }}>
        <Stack spacing={3} sx={{ textAlign: 'center' }}>
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 64, mx: 'auto' }} />
          
          <Typography variant="h4" sx={{ color: '#292929', fontWeight: 800 }}>
            Добро пожаловать!
          </Typography>
          
          <Typography variant="h6" sx={{ color: '#616161', fontWeight: 600 }}>
            {getUserDisplayName()}
          </Typography>

          <Alert severity="success" sx={{ borderRadius: 3 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>Авторизация успешна</AlertTitle>
            Вы успешно вошли в систему мониторинга цен
          </Alert>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ justifyContent: 'center', mt: 2 }}>
            <DashboardIcon sx={{ color: '#f57838', fontSize: 24 }} />
            <Typography variant="body1" sx={{ color: '#292929', fontWeight: 600 }}>
              Переход на главную страницу...
            </Typography>
            <CircularProgress size={20} sx={{ color: '#f57838' }} />
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default WelcomeScreen;
