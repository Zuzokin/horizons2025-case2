import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Edit,
  Save,
  Cancel,
  Computer,
  Public,
  NetworkCheck
} from '@mui/icons-material';
import { fetchWithTimeout } from '../config/apiConfig';

interface ServerConfigPanelProps {
  onConfigChange?: (config: any) => void;
}

function ServerConfigPanel({ onConfigChange }: ServerConfigPanelProps) {
  const [serverIp, setServerIp] = useState('localhost');
  const [serverPort, setServerPort] = useState('80');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [editMode, setEditMode] = useState(false);
  const [tempIp, setTempIp] = useState('');
  const [tempPort, setTempPort] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Загружаем сохраненную конфигурацию
    const savedIp = localStorage.getItem('server_ip') || 'localhost';
    const savedPort = localStorage.getItem('server_port') || '80';
    setServerIp(savedIp);
    setServerPort(savedPort);
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetchWithTimeout(`http://${serverIp}:${serverPort}/health`, {
        method: 'GET',
        mode: 'cors'
      }, 5000);
      setConnectionStatus(response.ok ? 'connected' : 'error');
    } catch (error) {
      console.warn('Server connection test failed:', error);
      setConnectionStatus('error');
    }
  };

  const handleEdit = () => {
    setTempIp(serverIp);
    setTempPort(serverPort);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleSave = () => {
    setServerIp(tempIp);
    setServerPort(tempPort);
    localStorage.setItem('server_ip', tempIp);
    localStorage.setItem('server_port', tempPort);
    setEditMode(false);
    setOpenDialog(false);
    checkConnection();
    
    // Перезагружаем страницу для применения изменений
    window.location.reload();
  };

  const handleCancel = () => {
    setEditMode(false);
    setOpenDialog(false);
    setTempIp(serverIp);
    setTempPort(serverPort);
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
    <>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#f8f9fa' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Settings sx={{ color: '#f57838', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: '#292929', fontWeight: 700 }}>
              Настройка сервера
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Проверить подключение">
              <IconButton onClick={checkConnection} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Изменить настройки">
              <IconButton onClick={handleEdit} size="small">
                <Edit />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Адрес сервера:
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
              http://{serverIp}:{serverPort}
            </Typography>
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

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Информация о подключении:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip 
                icon={<Computer />}
                label={`IP: ${serverIp}`}
                size="small"
                color="primary"
              />
              <Chip 
                icon={<Public />}
                label={`Порт: ${serverPort}`}
                size="small"
                color="secondary"
              />
              <Chip 
                icon={<NetworkCheck />}
                label="HTTP"
                size="small"
                color="info"
              />
            </Stack>
          </Box>

          {connectionStatus === 'error' && (
            <Alert severity="error">
              <AlertTitle>Проблема с подключением к серверу</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Не удается подключиться к серверу по адресу <strong>http://{serverIp}:{serverPort}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Возможные причины:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Сервер не запущен</li>
                <li>Неправильный IP адрес или порт</li>
                <li>Проблемы с сетью</li>
                <li>Блокировка файрволом</li>
              </ul>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleEdit}
                sx={{ mt: 1 }}
              >
                Изменить настройки
              </Button>
            </Alert>
          )}

          {connectionStatus === 'connected' && (
            <Alert severity="success">
              <AlertTitle>Подключение установлено</AlertTitle>
              <Typography variant="body2">
                Успешно подключено к серверу по адресу <strong>http://{serverIp}:{serverPort}</strong>
              </Typography>
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* Диалог редактирования */}
      <Dialog open={openDialog} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Настройка сервера</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="IP адрес сервера"
              value={tempIp}
              onChange={(e) => setTempIp(e.target.value)}
              fullWidth
              placeholder="localhost"
              helperText="Введите IP адрес сервера, на котором запущен бэкенд"
            />
            <TextField
              label="Порт сервера"
              value={tempPort}
              onChange={(e) => setTempPort(e.target.value)}
              fullWidth
              placeholder="8000"
              helperText="Введите порт, на котором запущен бэкенд"
            />
            <Alert severity="info">
              <Typography variant="body2">
                После сохранения изменений страница будет перезагружена для применения новых настроек.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<Cancel />}>
            Отмена
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<Save />}
            sx={{
              bgcolor: '#f57838',
              '&:hover': { bgcolor: '#ff8c38' },
              color: '#fff',
              fontWeight: 700,
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ServerConfigPanel;
