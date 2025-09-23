import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Alert,
  AlertTitle,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';
import RefreshIcon from '@mui/icons-material/Refresh';

interface CompetitorNotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

interface CompetitorNotification {
  id: string;
  competitor: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
}

function CompetitorNotificationsModal({ open, onClose }: CompetitorNotificationsModalProps) {
  const [notifications] = useState<CompetitorNotification[]>([
    {
      id: 'NOTIF001',
      competitor: 'Северсталь',
      message: 'Повысили цены на трубы ⌀57х3.5 на 1.0% (до 76 000 ₽/т)',
      severity: 'info',
      timestamp: '14:30',
    },
    {
      id: 'NOTIF002',
      competitor: 'ММК',
      message: 'Снизили цены на трубы ⌀108х4 на 0.8% (до 78 000 ₽/т)',
      severity: 'warning',
      timestamp: '12:15',
    },
    {
      id: 'NOTIF003',
      competitor: 'НЛМК',
      message: 'Стабильные цены на трубы ⌀76х3 (74 500 ₽/т) - без изменений 2 дня',
      severity: 'success',
      timestamp: 'Вчера',
    },
    {
      id: 'NOTIF004',
      competitor: 'ТМК',
      message: 'Новые поставки труб ⌀89х4 ожидаются на следующей неделе',
      severity: 'info',
      timestamp: '10:45',
    },
    {
      id: 'NOTIF005',
      competitor: 'ЧТПЗ',
      message: 'Снижение цен на трубы ⌀159х6 на 2.1% (до 82 000 ₽/т)',
      severity: 'warning',
      timestamp: '09:20',
    },
    {
      id: 'NOTIF006',
      competitor: 'Северсталь',
      message: 'Ограниченные поставки труб ⌀219х8 - осталось 15 тонн',
      severity: 'error',
      timestamp: 'Вчера',
    },
  ]);

  const handleRefresh = () => {
    // В демонстрационном режиме просто показываем сообщение
    console.log('Обновление уведомлений (демонстрационный режим)');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '400px',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <NotificationsIcon sx={{ color: '#f57838', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800 }}>
            Уведомления конкурентов
          </Typography>
        </Stack>
        <Box>
          <IconButton
            onClick={handleRefresh}
            size="small"
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Alert 
              key={notification.id}
              severity={notification.severity} 
              sx={{ borderRadius: 2 }}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BusinessIcon fontSize="small" />
                  <span>{notification.competitor}</span>
                  <Typography variant="caption" sx={{ ml: 'auto', opacity: 0.7 }}>
                    {notification.timestamp}
                  </Typography>
                </Stack>
              </AlertTitle>
              {notification.message}
            </Alert>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: '#f57838',
            color: '#f57838',
            '&:hover': { borderColor: '#f57838' }
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompetitorNotificationsModal;
