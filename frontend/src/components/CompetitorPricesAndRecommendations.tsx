import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Alert, AlertTitle, CircularProgress } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getPriceRecommendations, getCompetitorNotifications, applyPriceRecommendation } from '../api';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface CompetitorPricesAndRecommendationsProps {
  filters: FilterState;
}

function CompetitorPricesAndRecommendations({ filters }: CompetitorPricesAndRecommendationsProps) {
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем рекомендации по ценам
        const recommendations = await getPriceRecommendations(filters);
        
        // Получаем уведомления о конкурентах
        const notifications = await getCompetitorNotifications();
        
        // Объединяем данные
        const combined = recommendations.map((rec: any, index: number) => ({
          id: rec.id || `REC${index + 1}`,
          product: rec.product || rec.product_name || 'Неизвестный продукт',
          competitor: rec.competitor || rec.competitor_name || 'Конкурент',
          competitorPrice: rec.competitor_price || rec.competitorPrice || 0,
          competitorChange: rec.competitor_change || rec.competitorChange || '0%',
          competitorStatus: rec.competitor_status || rec.competitorStatus || 'stable',
          currentPrice: rec.current_price || rec.currentPrice || 0,
          recommendedPrice: rec.recommended_price || rec.recommendedPrice || 0,
          change: rec.change || 0,
          percentage: rec.percentage || '0%',
          reason: rec.reason || rec.recommendation_reason || 'Нет данных',
          status: rec.status || 'pending',
        }));
        
        setCombinedData(combined);
      } catch (err) {
        console.error('Error fetching competitor data:', err);
        setError('Ошибка загрузки данных о конкурентах');
        
        // Fallback к моковым данным при ошибке
        const mockData = [
          {
            id: 'C001',
            product: 'Труба стальная ⌀57х3.5',
            competitor: 'Северсталь',
            competitorPrice: 76000,
            competitorChange: '+1.0%',
            competitorStatus: 'up',
            currentPrice: 75000,
            recommendedPrice: 74500,
            change: -500,
            percentage: '-0.67%',
            reason: 'Высокие складские остатки, снижение спроса',
            status: 'pending',
          },
          {
            id: 'C002',
            product: 'Труба профильная 60х40х2',
            competitor: 'НЛМК',
            competitorPrice: 81500,
            competitorChange: '-0.2%',
            competitorStatus: 'stable',
            currentPrice: 82000,
            recommendedPrice: 83000,
            change: +1000,
            percentage: '+1.22%',
            reason: 'Рост цен у конкурентов, высокий спрос',
            status: 'pending',
          },
        ];
        setCombinedData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleApplyRecommendation = async (id: string) => {
    try {
      await applyPriceRecommendation(id);
      // Обновляем статус в локальном состоянии
      setCombinedData(prev => 
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
          Загрузка данных о конкурентах...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <CompareArrowsIcon sx={{ color: '#f57838', fontSize: 36 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1 }}>
          Цены конкурентов и рекомендации{getActiveFiltersText()}
        </Typography>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Предупреждение</AlertTitle>
          {error}. Используются демонстрационные данные.
        </Alert>
      )}

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
        Сравнение цен и рекомендации по корректировке ({combinedData.length} позиций)
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 4, mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Продукт</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Конкурент</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Цена конкурента (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Изменение конкурента</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Текущая цена ТМК (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Рекомендуемая цена (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Изменение</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Причина</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combinedData.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ color: '#292929', fontWeight: 700 }}>{row.product}</TableCell>
                <TableCell sx={{ color: '#292929', fontWeight: 600 }}>{row.competitor}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.competitorPrice ? row.competitorPrice.toLocaleString() : 'N/A'}</TableCell>
                <TableCell sx={{ color: row.competitorChange.includes('+') ? 'green' : 'red' }}>
                  {row.competitorChange}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.currentPrice ? row.currentPrice.toLocaleString() : 'N/A'}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.recommendedPrice ? row.recommendedPrice.toLocaleString() : 'N/A'}</TableCell>
                <TableCell sx={{ color: row.change > 0 ? 'green' : row.change < 0 ? 'red' : 'inherit', fontWeight: 600 }}>
                  {row.change > 0 && <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />}
                  {row.change < 0 && <TrendingDownIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />}
                  {row.change} ({row.percentage})
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{row.reason}</TableCell>
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

export default CompetitorPricesAndRecommendations;
