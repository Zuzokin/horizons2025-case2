import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  AlertTitle
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';

function CompetitorNotifications() {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#f8f9fa' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <NotificationsIcon sx={{ color: '#f57838', fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800 }}>
          Уведомления об активности конкурентов
        </Typography>
      </Stack>
      
      <Stack spacing={2}>
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <BusinessIcon fontSize="small" />
              <span>Северсталь</span>
            </Stack>
          </AlertTitle>
          Повысили цены на трубы ⌀57х3.5 на 1.0% (до 76 000 ₽/т) в 14:30
        </Alert>
        
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <BusinessIcon fontSize="small" />
              <span>ММК</span>
            </Stack>
          </AlertTitle>
          Снизили цены на трубы ⌀108х4 на 0.8% (до 78 000 ₽/т) в 12:15
        </Alert>
        
        <Alert severity="success" sx={{ borderRadius: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <BusinessIcon fontSize="small" />
              <span>НЛМК</span>
            </Stack>
          </AlertTitle>
          Стабильные цены на трубы ⌀76х3 (74 500 ₽/т) - без изменений 2 дня
        </Alert>
      </Stack>
    </Paper>
  );
}

export default CompetitorNotifications;
