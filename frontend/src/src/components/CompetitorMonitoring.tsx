import React from 'react';
import { Box, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface CompetitorMonitoringProps {
  filters: FilterState;
}

const mockCompetitorPrices = [
  { id: 'C001', name: 'Северсталь', product: 'Труба стальная ⌀57х3.5', price: 76000, lastChange: '+1.0%', status: 'up' },
  { id: 'C002', name: 'НЛМК', product: 'Труба профильная 60х40х2', price: 81500, lastChange: '-0.2%', status: 'stable' },
  { id: 'C003', name: 'ММК', product: 'Труба бесшовная ⌀108х4', price: 97000, lastChange: '+1.5%', status: 'up' },
  { id: 'C004', name: 'ЧТПЗ', product: 'Труба электросварная ⌀76х3', price: 71000, lastChange: '+0.5%', status: 'stable' },
];

const mockNotifications = [
  { id: 1, type: 'alert', message: 'Северсталь снизила цену на Трубу стальную ⌀57х3.5 на 2%!', time: '10 минут назад' },
  { id: 2, type: 'info', message: 'НЛМК обновил прайс-лист. Цены стабильны.', time: '1 час назад' },
  { id: 3, type: 'alert', message: 'ММК повысил цену на Трубу бесшовную ⌀108х4 на 1.5%.', time: '3 часа назад' },
  { id: 4, type: 'info', message: 'ЧТПЗ добавил новый ассортимент в каталог.', time: 'Вчера' },
];

function CompetitorMonitoring({ filters }: CompetitorMonitoringProps) {
  const getActiveFiltersText = () => {
    const activeFilters = [];
    if (filters.productType !== 'Все виды') activeFilters.push(filters.productType);
    if (filters.warehouse !== 'Все склады') activeFilters.push(filters.warehouse);
    if (filters.name) activeFilters.push(`"${filters.name}"`);
    if (filters.steelGrade !== 'Все марки') activeFilters.push(filters.steelGrade);
    if (filters.diameter !== 'Все диаметры') activeFilters.push(filters.diameter);
    if (filters.gost !== 'Все ГОСТы') activeFilters.push(filters.gost);
    
    return activeFilters.length > 0 ? ` (${activeFilters.join(', ')})` : '';
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <CompareArrowsIcon sx={{ color: '#f57838', fontSize: 36 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1 }}>
          Мониторинг конкурентов{getActiveFiltersText()}
        </Typography>
      </Stack>

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
        Цены конкурентов по ключевым продуктам
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 4, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Конкурент</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Продукт</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Цена (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Изменение за 24ч</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockCompetitorPrices.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ color: '#292929', fontWeight: 700 }}>{row.name}</TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell sx={{ color: row.lastChange.includes('+') ? 'green' : 'red' }}>{row.lastChange}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status === 'up' ? 'Растет' : row.status === 'down' ? 'Падает' : 'Стабильно'}
                    sx={{
                      bgcolor: row.status === 'up' ? '#e8f5e9' : row.status === 'down' ? '#ffebee' : '#f5f5f5',
                      color: row.status === 'up' ? '#4caf50' : row.status === 'down' ? '#f44336' : '#616161',
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <NotificationsActiveIcon sx={{ color: '#f57838', fontSize: 36 }} />
        <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1 }}>
          Уведомления об активности конкурентов
        </Typography>
      </Stack>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, bgcolor: '#f8f8f8', boxSizing: 'border-box' }}>
        <List>
          {mockNotifications.map((notification) => (
            <ListItem key={notification.id} divider>
              <ListItemIcon>
                {notification.type === 'alert' ? (
                  <WarningAmberIcon sx={{ color: '#f44336' }} />
                ) : (
                  <CheckCircleOutlineIcon sx={{ color: '#4caf50' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="body1" sx={{ fontWeight: 700, color: '#292929' }}>{notification.message}</Typography>}
                secondary={<Typography variant="body2" sx={{ color: '#c8c8c8' }}>{notification.time}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default CompetitorMonitoring;