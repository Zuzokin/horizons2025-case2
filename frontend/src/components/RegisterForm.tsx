import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.firstName, formData.lastName, formData.password);
      setSuccess(true);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4, maxWidth: 400, mx: 'auto', bgcolor: '#fff' }}>
        <Stack spacing={3} sx={{ textAlign: 'center' }}>
          <PersonAddIcon sx={{ color: '#4caf50', fontSize: 48, mx: 'auto' }} />
          <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800 }}>
            Регистрация успешна!
          </Typography>
          <Typography variant="body1" sx={{ color: '#616161' }}>
            Теперь вы можете войти в систему
          </Typography>
          <Button
            variant="contained"
            onClick={onSwitchToLogin}
            startIcon={<LoginIcon />}
            sx={{
              bgcolor: '#f57838',
              '&:hover': { bgcolor: '#ff8c38' },
              fontWeight: 700
            }}
          >
            Войти
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper elevation={6} sx={{ p: 4, borderRadius: 4, maxWidth: 400, mx: 'auto', bgcolor: '#fff' }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <PersonAddIcon sx={{ color: '#f57838', fontSize: 48, mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#292929', fontWeight: 800, mb: 1 }}>
            Регистрация
          </Typography>
          <Typography variant="body2" sx={{ color: '#616161' }}>
            Создайте аккаунт для доступа к системе
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
              value={formData.email}
              onChange={handleChange('email')}
              required
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
              }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Имя"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
                }}
              />
              <TextField
                fullWidth
                label="Фамилия"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
                }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              helperText="Минимум 6 символов"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
              }}
            />

            <TextField
              fullWidth
              label="Подтвердите пароль"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
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
              startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
              sx={{
                bgcolor: '#f57838',
                '&:hover': { bgcolor: '#ff8c38' },
                fontWeight: 700,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#616161', mb: 1 }}>
            Уже есть аккаунт?
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={onSwitchToLogin}
            sx={{
              color: '#f57838',
              fontWeight: 700,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Войти
          </Link>
        </Box>
      </Stack>
    </Paper>
  );
}

export default RegisterForm;
