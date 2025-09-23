import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Settings,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Info,
  ExpandMore,
  ExpandLess,
  NetworkCheck,
  Computer,
  Public
} from '@mui/icons-material';
import { 
  getApiConfig, 
  getCurrentEnvironment, 
  getEnvironmentConfig, 
  testApiConnection, 
  getServerInfo,
  API_ENDPOINTS 
} from '../config/apiConfig';

interface ApiConfigPanelProps {
  onConfigChange?: (config: any) => void;
}

function ApiConfigPanel({ onConfigChange }: ApiConfigPanelProps) {
  const [config, setConfig] = useState(getApiConfig());
  const [environment, setEnvironment] = useState(getCurrentEnvironment());
  const [envConfig, setEnvConfig] = useState(getEnvironmentConfig());
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkConnection();
    loadServerInfo();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await testApiConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const loadServerInfo = async () => {
    try {
      const info = await getServerInfo();
      setServerInfo(info);
    } catch (error) {
      console.warn('Failed to load server info:', error);
    }
  };

  const handleRefresh = () => {
    setConfig(getApiConfig());
    setEnvironment(getCurrentEnvironment());
    setEnvConfig(getEnvironmentConfig());
    checkConnection();
    loadServerInfo();
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'error':
        return <Error sx={{ color: '#f44336' }} />;
      case 'checking':
        return <Warning sx={{ color: '#ff9800' }} />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'checking':
        return '#ff9800';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Подключено';
      case 'error':
        return 'Ошибка подключения';
      case 'checking':
        return 'Проверка...';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8f9fa' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Settings sx={{ color: '#f57838', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#292929', fontWeight: 700 }}>
            Конфигурация API
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Обновить конфигурацию">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <IconButton 
            onClick={() => setExpanded(!expanded)} 
            size="small"
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
      </Stack>

      {/* Основная информация */}
      <Stack spacing={2} mb={2}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Базовый URL API:
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: 'monospace', 
              bgcolor: '#e3f2fd', 
              p: 1, 
              borderRadius: 1,
              wordBreak: 'break-all'
            }}
          >
            {config.baseUrl}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Окружение:
          </Typography>
          <Chip 
            label={environment}
            color={environment === 'production' ? 'success' : environment === 'development' ? 'warning' : 'info'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Статус подключения:
          </Typography>
          <Chip 
            icon={getStatusIcon()}
            label={getStatusText()}
            sx={{ 
              bgcolor: getStatusColor(), 
              color: 'white',
              '&:hover': { bgcolor: getStatusColor() }
            }}
            size="small"
          />
        </Box>
      </Stack>

      {/* Детальная информация */}
      <Collapse in={expanded}>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Детальная информация:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <Computer fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Текущий хост"
              secondary={window.location.hostname}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Public fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Порт фронтенда"
              secondary={window.location.port || '80/443'}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <NetworkCheck fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Порт API"
              secondary={config.baseUrl.split(':').pop()}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Info fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Таймаут"
              secondary={`${config.timeout / 1000} секунд`}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Refresh fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Повторы"
              secondary={`${config.retries} раз`}
            />
          </ListItem>
        </List>

        {serverInfo && (
          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Информация о сервере:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {JSON.stringify(serverInfo, null, 2)}
              </Typography>
            </Paper>
          </Box>
        )}

        <Box mt={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Доступные эндпоинты:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {JSON.stringify(API_ENDPOINTS, null, 2)}
            </Typography>
          </Paper>
        </Box>
      </Collapse>

      {/* Предупреждения */}
      {connectionStatus === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Проблема с подключением к API</AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Не удается подключиться к серверу API. Возможные причины:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Сервер API не запущен</li>
            <li>Неправильный адрес или порт</li>
            <li>Проблемы с сетью</li>
            <li>Блокировка файрволом</li>
          </ul>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={checkConnection}
            sx={{ mt: 1 }}
          >
            Проверить снова
          </Button>
        </Alert>
      )}

      {environment === 'development' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Режим разработки</AlertTitle>
          <Typography variant="body2">
            Приложение работает в режиме разработки. API автоматически настроен на локальный сервер.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
}

export default ApiConfigPanel;
