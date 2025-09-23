import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../contexts/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа в систему');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={6} sx={{ p: 4, borderRadius: 4, maxWidth: 400, mx: 'auto', bgcolor: '#fff' }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <LoginIcon sx={{ color: '#f57838', fontSize: 48, mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#292929', fontWeight: 800, mb: 1 }}>
            Вход в систему
          </Typography>
          <Typography variant="body2" sx={{ color: '#616161' }}>
            Дашборд мониторинга цен на металлопродукцию
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
              }}
            />

            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{
                bgcolor: '#f57838',
                '&:hover': { bgcolor: '#ff8c38' },
                fontWeight: 700,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#616161' }}>
            Для регистрации обратитесь к администратору системы
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default LoginForm;
