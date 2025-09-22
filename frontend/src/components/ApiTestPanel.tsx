import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import ApiIcon from '@mui/icons-material/Api';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { testApiConnection, openSwagger } from '../utils/apiTest';

function ApiTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestApi = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testApiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Ошибка: ${error}`,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSwagger = () => {
    openSwagger();
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#f8f9fa' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <ApiIcon sx={{ color: '#f57838', fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800 }}>
          Тестирование API подключения
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="body2" sx={{ color: '#616161' }}>
          Базовый URL: <strong>http://10.20.3.135:8000</strong>
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleTestApi}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <ApiIcon />}
            sx={{
              bgcolor: '#f57838',
              '&:hover': { bgcolor: '#ff8c38' },
              fontWeight: 700
            }}
          >
            {isLoading ? 'Тестирование...' : 'Тестировать API'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleOpenSwagger}
            startIcon={<OpenInNewIcon />}
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
            Открыть Swagger
          </Button>
        </Stack>

        {testResult && (
          <>
            <Divider />
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              icon={testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
              sx={{ borderRadius: 3 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                {testResult.success ? '✅ API подключение успешно' : '❌ Ошибка подключения'}
              </Typography>
              <Typography variant="body2">
                {testResult.message}
              </Typography>
              
              {testResult.success && testResult.data && (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      label="Health Check ✅" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                    <Chip 
                      label="Pricing Data ✅" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                    <Chip 
                      label="Notifications ✅" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              )}
            </Alert>
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default ApiTestPanel;
