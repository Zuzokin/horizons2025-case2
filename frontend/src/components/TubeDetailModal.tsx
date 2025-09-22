import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TubeMarketOverview from './TubeMarketOverview';

interface TubeDetailModalProps {
  open: boolean;
  onClose: () => void;
  tubeData: any;
}

function TubeDetailModal({ open, onClose, tubeData }: TubeDetailModalProps) {
  if (!tubeData) return null;

  // Создаем фильтры для аналитики на основе выбранной трубы
  const tubeFilters = {
    productType: tubeData['вид продукции'] || 'Все виды',
    warehouse: tubeData['склад'] || 'Все склады',
    name: tubeData['наименование'] || '',
    steelGrade: tubeData['марка стали'] || 'Все марки',
    diameter: tubeData['диаметр'] || 'Все диаметры',
    gost: tubeData['ГОСТ'] || 'Все ГОСТы'
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh',
          bgcolor: '#fff'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <TrendingUpIcon sx={{ color: '#f57838', fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800 }}>
                Детальный анализ трубы
              </Typography>
              <Typography variant="body1" sx={{ color: '#616161', mt: 0.5 }}>
                {tubeData['наименование']}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#616161',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
        <TubeMarketOverview filters={tubeFilters} />
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f8f8' }}>
        <Box sx={{ flex: 1 }} />
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: '#f57838',
            color: '#fff',
            '&:hover': { bgcolor: '#ff8c38' },
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          Закрыть
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}

export default TubeDetailModal;
