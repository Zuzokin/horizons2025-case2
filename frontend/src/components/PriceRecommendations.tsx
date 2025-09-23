import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Alert, AlertTitle, CircularProgress } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getPriceRecommendations, applyPriceRecommendation } from '../api';

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

function PriceRecommendations({ filters }: PriceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getPriceRecommendations(filters);
        
        // Преобразуем данные API в формат компонента
        const formattedData = data.map((rec: any, index: number) => ({
          id: rec.id || `REC${index + 1}`,
          product: rec.product || rec.product_name || 'Неизвестный продукт',
          currentPrice: rec.current_price || rec.currentPrice || 0,
          recommendedPrice: rec.recommended_price || rec.recommendedPrice || 0,
          change: rec.change || 0,
          percentage: rec.percentage || '0%',
          reason: rec.reason || rec.recommendation_reason || 'Нет данных',
          potentialProfitImpact: rec.profit_impact || rec.potentialProfitImpact || '0%',
          status: rec.status || 'pending',
        }));
        
        setRecommendations(formattedData);
      } catch (err) {
        console.error('Error fetching price recommendations:', err);
        setError('Ошибка загрузки рекомендаций по ценам');
        
        // Fallback к моковым данным при ошибке
        const mockData = [
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
        ];
        setRecommendations(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [filters]);

  const handleApplyRecommendation = async (id: string) => {
    try {
      await applyPriceRecommendation(id);
      // Обновляем статус в локальном состоянии
      setRecommendations(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: 'applied' } : item
        )
      );
    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Загрузка рекомендаций по ценам...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <LightbulbIcon sx={{ color: '#f57838', fontSize: 36 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1 }}>
          Рекомендации по ценообразованию{getActiveFiltersText()}
        </Typography>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Предупреждение</AlertTitle>
          {error}. Используются демонстрационные данные.
        </Alert>
      )}

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
        Предлагаемые корректировки цен ({recommendations.length} позиций)
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
            {recommendations.map((row) => (
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