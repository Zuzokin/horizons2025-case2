import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stack
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

interface BackendConfigProps {
  onBackendChange?: (backend: string) => void;
}

function BackendConfig({ onBackendChange }: BackendConfigProps) {
  const [backendUrl, setBackendUrl] = useState('localhost:80');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const testBackend = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`http://${backendUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setTestResult('success');
        if (onBackendChange) {
          onBackendChange(`http://${backendUrl}`);
        }
        // Сохраняем в localStorage
        localStorage.setItem('backend_url', `http://${backendUrl}`);
      } else {
        setTestResult('error');
      }
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleApply = () => {
    if (onBackendChange) {
      onBackendChange(`http://${backendUrl}`);
    }
    localStorage.setItem('backend_url', `http://${backendUrl}`);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <SettingsIcon />
          <Typography variant="h6">Настройка Backend</Typography>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Backend URL"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="localhost:80"
            helperText="Введите адрес и порт backend сервера"
            sx={{ mb: 2 }}
          />
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={testBackend}
              disabled={isTesting}
            >
              {isTesting ? 'Проверка...' : 'Проверить'}
            </Button>
            
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!backendUrl}
            >
              Применить
            </Button>
          </Stack>
        </Box>

        {testResult === 'success' && (
          <Alert severity="success">
            Backend доступен! Подключение установлено.
          </Alert>
        )}

        {testResult === 'error' && (
          <Alert severity="error">
            Backend недоступен. Проверьте адрес и порт.
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Попробуйте разные варианты:
          <br />• localhost:80 (через nginx)
          <br />• localhost:8000 (локальный backend)
        </Typography>
      </CardContent>
    </Card>
  );
}

export default BackendConfig;
