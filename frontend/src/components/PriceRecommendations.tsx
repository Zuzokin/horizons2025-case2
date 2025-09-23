import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { getMetalsPricingData, getBulkPriceRecommendations } from '../api';

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

interface Recommendation {
  id: string;
  product: string;
  currentPrice: number;
  recommendedPrice: number;
  change: number;
  percentage: string;
  reason: string;
  potentialProfitImpact: string;
  status: 'pending' | 'applied';
  confidence: number;
  explain: string;
  baselineTarget: number;
  marketAnchor: number | null;
  competitorsUsed: number;
}

function PriceRecommendations({ filters }: PriceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [filters]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Получаем данные о продуктах
      const productsData = await getMetalsPricingData(50, 0);
      console.log('Products data received:', productsData);
      
      if (!productsData || !productsData.records || productsData.records.length === 0) {
        console.log('No products data found');
        setRecommendations([]);
        return;
      }

      console.log(`Found ${productsData.records.length} products`);

      // Фильтруем продукты по заданным фильтрам
      const filteredProducts = productsData.records.filter((product: any) => {
        if (filters.productType !== 'Все виды' && product['вид продукции'] !== filters.productType) return false;
        if (filters.warehouse !== 'Все склады' && product['склад'] !== filters.warehouse) return false;
        if (filters.name && !product['наименование']?.toLowerCase().includes(filters.name.toLowerCase())) return false;
        if (filters.steelGrade !== 'Все марки' && product['марка стали'] !== filters.steelGrade) return false;
        if (filters.diameter !== 'Все диаметры' && product['диаметр'] !== filters.diameter) return false;
        if (filters.gost !== 'Все ГОСТы' && product['ГОСТ'] !== filters.gost) return false;
        return true;
      });

      console.log(`After filtering: ${filteredProducts.length} products`);
      
      if (filteredProducts.length === 0) {
        console.log('No products match the filters');
        setRecommendations([]);
        return;
      }

      // Подготавливаем данные для API
      const productsForApi = filteredProducts.slice(0, 10).map((product: any, index: number) => ({
        вид_продукции: product['вид продукции'] || 'Труба',
        склад: product['склад'] || 'Основной',
        наименование: product['наименование'] || `Труба ${index + 1}`,
        марка_стали: product['марка стали'] || 'Ст3',
        диаметр: product['диаметр'] || '57',
        ГОСТ: product['ГОСТ'] || 'ГОСТ 10704-91',
        цена: product['цена'] || 75000,
        производитель: product['производитель'] || 'Наш завод',
        регион: product['регион'] || 'Москва'
      }));

      // Получаем рекомендации от API
      console.log('Sending request to API with products:', productsForApi);
      const apiRecommendations = await getBulkPriceRecommendations(productsForApi);
      console.log('API recommendations received:', apiRecommendations);
      
      // Преобразуем ответ API в формат компонента
      const formattedRecommendations: Recommendation[] = apiRecommendations.map((rec: any, index: number) => ({
        id: `REC${String(index + 1).padStart(3, '0')}`,
        product: rec.input.наименование,
        currentPrice: rec.input.цена,
        recommendedPrice: rec.decision.new_price,
        change: rec.decision.new_price - rec.input.цена,
        percentage: rec.decision.delta_percent ? `${rec.decision.delta_percent > 0 ? '+' : ''}${rec.decision.delta_percent}%` : '0%',
        reason: rec.explain,
        potentialProfitImpact: rec.decision.delta_percent ? `${rec.decision.delta_percent > 0 ? '+' : ''}${rec.decision.delta_percent}%` : '0%',
        status: 'pending' as const,
        confidence: rec.confidence,
        explain: rec.explain,
        baselineTarget: rec.targets.baseline_target_cost_plus,
        marketAnchor: rec.targets.market_anchor_median,
        competitorsUsed: rec.coverage.competitors_used
      }));

      setRecommendations(formattedRecommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Ошибка при загрузке рекомендаций. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = (id: string) => {
    const recommendation = recommendations.find((r: Recommendation) => r.id === id);
    if (recommendation) {
      // Здесь будет логика для отправки рекомендации на бэкенд
      alert(`Рекомендация ${id} применена! Новая цена: ${recommendation.recommendedPrice} руб/т`);
      // Обновляем статус
      setRecommendations((prev: Recommendation[]) => 
        prev.map((r: Recommendation) => r.id === id ? { ...r, status: 'applied' as const } : r)
      );
    }
  };

  const handleShowDetails = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setDetailDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailDialogOpen(false);
    setSelectedRecommendation(null);
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
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadRecommendations}
          disabled={loading}
          sx={{
            borderColor: '#f57838',
            color: '#f57838',
            '&:hover': { borderColor: '#ff8c38', backgroundColor: '#fff3e0' },
            fontWeight: 700,
            borderRadius: 2,
          }}
        >
          Обновить
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress sx={{ color: '#f57838' }} />
          <Typography variant="h6" sx={{ ml: 2, color: '#292929' }}>
            Анализируем цены...
          </Typography>
        </Box>
      )}

      {!loading && recommendations.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Нет данных для анализа. Проверьте фильтры или загрузите данные о продуктах.
        </Alert>
      )}

      {!loading && recommendations.length > 0 && (
        <>
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
                  <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Уверенность</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Действие</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations.map((row: Recommendation) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: '#292929', fontWeight: 700 }}>{row.product}</TableCell>
                    <TableCell>{row.currentPrice.toLocaleString()}</TableCell>
                    <TableCell>{row.recommendedPrice.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: row.change > 0 ? 'green' : row.change < 0 ? 'red' : 'inherit', fontWeight: 700 }}>
                      {row.change > 0 && <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />}
                      {row.change < 0 && <TrendingDownIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />}
                      {row.change > 0 ? '+' : ''}{row.change.toLocaleString()} ({row.percentage})
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${Math.round(row.confidence * 100)}%`}
                        sx={{
                          bgcolor: row.confidence > 0.7 ? '#e8f5e9' : row.confidence > 0.5 ? '#fff3e0' : '#ffebee',
                          color: row.confidence > 0.7 ? '#4caf50' : row.confidence > 0.5 ? '#ff9800' : '#f44336',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
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
                      <Stack direction="row" spacing={1}>
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
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => handleShowDetails(row)}
                          sx={{
                            borderColor: '#f57838',
                            color: '#f57838',
                            '&:hover': { borderColor: '#ff8c38', backgroundColor: '#fff3e0' },
                            fontWeight: 700,
                            borderRadius: 2,
                          }}
                        >
                          Детали
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Диалог с деталями рекомендации */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: '#292929', fontWeight: 800 }}>
          Детали рекомендации
        </DialogTitle>
        <DialogContent>
          {selectedRecommendation && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {selectedRecommendation.product}
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  {selectedRecommendation.explain}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Анализ ценообразования
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Текущая цена:</Typography>
                    <Typography fontWeight={700}>{selectedRecommendation.currentPrice.toLocaleString()} руб/т</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Рекомендуемая цена:</Typography>
                    <Typography fontWeight={700} color={selectedRecommendation.change > 0 ? 'green' : selectedRecommendation.change < 0 ? 'red' : 'inherit'}>
                      {selectedRecommendation.recommendedPrice.toLocaleString()} руб/т
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Cost-plus целевая цена:</Typography>
                    <Typography fontWeight={700}>{selectedRecommendation.baselineTarget.toLocaleString()} руб/т</Typography>
                  </Box>
                  {selectedRecommendation.marketAnchor && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Рыночная медиана:</Typography>
                      <Typography fontWeight={700}>{selectedRecommendation.marketAnchor.toLocaleString()} руб/т</Typography>
                    </Box>
                  )}
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Конкурентов найдено:</Typography>
                    <Typography fontWeight={700}>{selectedRecommendation.competitorsUsed}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Уверенность:</Typography>
                    <Typography fontWeight={700}>{Math.round(selectedRecommendation.confidence * 100)}%</Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} sx={{ color: '#f57838', fontWeight: 700 }}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PriceRecommendations;