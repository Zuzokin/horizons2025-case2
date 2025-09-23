import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { getApiConfig, testApiConnection } from '../config/apiConfig';

interface ApiStatusProps {
  onApiUrlChange?: (url: string) => void;
}

function ApiStatus({ onApiUrlChange }: ApiStatusProps) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const checkApiStatus = async () => {
    setIsChecking(true);
    setStatus('checking');
    setError('');

    try {
      // Проверяем сохраненный backend URL
      const savedBackendUrl = localStorage.getItem('backend_url');
      let config;
      
      if (savedBackendUrl) {
        config = { baseUrl: savedBackendUrl };
        console.log('🔧 Using saved backend URL:', savedBackendUrl);
      } else {
        config = getApiConfig();
      }
      
      setCurrentUrl(config.baseUrl);
      
      if (onApiUrlChange) {
        onApiUrlChange(config.baseUrl);
      }

      // Проверяем доступность
      const isAvailable = await testApiConnection();
      
      if (isAvailable) {
        setStatus('available');
      } else {
        setStatus('unavailable');
        setError('API сервер недоступен. Используются демонстрационные данные.');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <CircularProgress size={20} />;
      case 'available':
        return <CheckCircleIcon color="success" />;
      case 'unavailable':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <ErrorIcon color="error" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'success';
      case 'unavailable':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Проверка подключения...';
      case 'available':
        return 'API доступен';
      case 'unavailable':
        return 'API недоступен';
      case 'error':
        return 'Ошибка подключения';
      default:
        return 'Неизвестный статус';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Статус API подключения
        </Typography>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor() as any}
          variant="outlined"
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={checkApiStatus}
          disabled={isChecking}
        >
          Проверить
        </Button>
      </Stack>

      {currentUrl && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Текущий API URL: <code>{currentUrl}</code>
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Ошибка подключения</AlertTitle>
          {error}
        </Alert>
      )}

      {status === 'unavailable' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Демонстрационный режим</AlertTitle>
          API сервер недоступен. Приложение работает с демонстрационными данными.
        </Alert>
      )}

      {status === 'available' && (
        <Alert severity="success">
          <AlertTitle>Подключение установлено</AlertTitle>
          API сервер работает корректно
        </Alert>
      )}
    </Box>
  );
}

export default ApiStatus;
