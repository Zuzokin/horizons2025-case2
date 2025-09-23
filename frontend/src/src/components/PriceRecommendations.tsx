import React from 'react';
import { Box, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface PriceRecommendationsProps {
  filters: FilterState;
}

const mockRecommendations = [
  {
    id: 'REC001',
    product: 'Труба стальная ⌀57х3.5',
    currentPrice: 75000,
    recommendedPrice: 74500,
    change: -500,
    percentage: '-0.67%',
    reason: 'Высокие складские остатки, снижение спроса',
    potentialProfitImpact: '+1.2%',
    status: 'pending',
  },
  {
    id: 'REC002',
    product: 'Труба профильная 60х40х2',
    currentPrice: 82000,
    recommendedPrice: 83000,
    change: +1000,
    percentage: '+1.22%',
    reason: 'Рост цен у конкурентов, высокий спрос',
    potentialProfitImpact: '+2.5%',
    status: 'pending',
  },
  {
    id: 'REC003',
    product: 'Труба бесшовная ⌀108х4',
    currentPrice: 95000,
    recommendedPrice: 95000,
    change: 0,
    percentage: '0%',
    reason: 'Стабильный рынок, оптимальная цена',
    potentialProfitImpact: '0%',
    status: 'applied',
  },
  {
    id: 'REC004',
    product: 'Труба электросварная ⌀76х3',
    currentPrice: 70000,
    recommendedPrice: 70800,
    change: +800,
    percentage: '+1.14%',
    reason: 'Сезонный рост спроса, низкие запасы',
    potentialProfitImpact: '+1.8%',
    status: 'pending',
  },
];

function PriceRecommendations({ filters }: PriceRecommendationsProps) {
  const handleApplyRecommendation = (id: string) => {
    alert(`Применить рекомендацию для ${id}`);
    // Здесь будет логика для отправки рекомендации на бэкенд или обновления состояния
  };

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
        <LightbulbIcon sx={{ color: '#f57838', fontSize: 36 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1 }}>
          Рекомендации по ценообразованию{getActiveFiltersText()}
        </Typography>
      </Stack>

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
        Предлагаемые корректировки цен
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 4, mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Продукт</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Текущая цена (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Рекомендуемая цена (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Изменение</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Причина</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Потенциальное влияние на прибыль</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRecommendations.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ color: '#292929', fontWeight: 700 }}>{row.product}</TableCell>
                <TableCell>{row.currentPrice}</TableCell>
                <TableCell>{row.recommendedPrice}</TableCell>
                <TableCell sx={{ color: row.change > 0 ? 'green' : row.change < 0 ? 'red' : 'inherit', fontWeight: 700 }}>
                  {row.change > 0 && <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />}
                  {row.change < 0 && <TrendingDownIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />}
                  {row.change} ({row.percentage})
                </TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell sx={{ color: row.potentialProfitImpact.includes('+') ? 'green' : 'inherit' }}>{row.potentialProfitImpact}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status === 'pending' ? 'Ожидает' : 'Применено'}
                    icon={row.status === 'pending' ? <ErrorOutlineIcon /> : <CheckCircleIcon />}
                    sx={{
                      bgcolor: row.status === 'pending' ? '#fff3e0' : '#e8f5e9',
                      color: row.status === 'pending' ? '#ff9800' : '#4caf50',
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
                <TableCell>
                  {row.status === 'pending' && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: '#f57838',
                        '&:hover': { bgcolor: '#ff8c38' },
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 2,
                      }}
                      onClick={() => handleApplyRecommendation(row.id)}
                    >
                      Применить
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default PriceRecommendations;