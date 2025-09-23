import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
  AlertTitle,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function CorsErrorPanel() {
  const handleOpenSwagger = () => {
    window.open('http://10.20.3.135:8000/docs', '_blank');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#fff3e0' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <ErrorIcon sx={{ color: '#ff9800', fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800 }}>
          Проблема с CORS настройками
        </Typography>
      </Stack>
      
      <Alert severity="warning" sx={{ borderRadius: 3, mb: 3 }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Обнаружена проблема</AlertTitle>
        Сервер не настроен для работы с фронтендом из-за отсутствия CORS настроек.
      </Alert>

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 700, mb: 2 }}>
        🔧 Решение для разработчика бэкенда:
      </Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#292929' }}>
          Добавьте CORS middleware в FastAPI:
        </Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: '#292929',
            color: '#fff',
            p: 2,
            borderRadius: 2,
            fontSize: '0.875rem',
            overflow: 'auto',
            fontFamily: 'monospace'
          }}
        >
{`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.20.3.39:3000",    # Ваш IP адрес
        "http://10.20.3.135:3000"    # IP сервера
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`}
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 700, mb: 2 }}>
        📋 Проверочный список:
      </Typography>

      <List sx={{ mb: 3 }}>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon sx={{ color: '#4caf50' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Добавить CORS middleware в main.py"
            secondary="Импортировать CORSMiddleware и настроить allow_origins"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon sx={{ color: '#4caf50' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Разрешить OPTIONS запросы"
            secondary="Сервер должен отвечать на preflight запросы"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon sx={{ color: '#4caf50' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Проверить базу данных"
            secondary="Убедиться, что база данных доступна и настроена"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckCircleIcon sx={{ color: '#4caf50' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Перезапустить сервер"
            secondary="После изменений перезапустить FastAPI сервер"
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleOpenSwagger}
          startIcon={<CodeIcon />}
          sx={{
            bgcolor: '#f57838',
            '&:hover': { bgcolor: '#ff8c38' },
            fontWeight: 700
          }}
        >
          Открыть Swagger API
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          startIcon={<SettingsIcon />}
          sx={{
            borderColor: '#f57838',
            color: '#f57838',
            fontWeight: 700,
            '&:hover': {
              borderColor: '#ff8c38',
              bgcolor: 'rgba(245, 120, 56, 0.08)'
            }
          }}
        >
          Обновить страницу
        </Button>
      </Stack>

      <Alert severity="info" sx={{ borderRadius: 3, mt: 3 }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Временное решение</AlertTitle>
        Пока CORS не настроен, вы можете тестировать API через Swagger документацию или использовать прокси-сервер.
      </Alert>
    </Paper>
  );
}

export default CorsErrorPanel;
