import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  Button,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Warning,
  CheckCircle,
  Info,
  Refresh,
  Download,
  Share,
  Star,
  StarBorder,
  Timeline,
  Assessment,
  Business
} from '@mui/icons-material';
import { TMKPricingAlgorithm, PricingAlgorithmFactory, PricingRecommendation, CompetitorPrice, MarketPosition } from '../algorithms/pricingAlgorithm';
import { RealMetalPricingRecord } from '../data/realMetalsPricingData';

interface PricingRecommendationsProps {
  filters?: any;
}

interface RecommendationCardProps {
  recommendation: PricingRecommendation;
  productData: RealMetalPricingRecord;
  onImplement?: (recommendation: PricingRecommendation) => void;
  onFavorite?: (recommendation: PricingRecommendation) => void;
  isFavorite?: boolean;
}

function RecommendationCard({ recommendation, productData, onImplement, onFavorite, isFavorite }: RecommendationCardProps) {
  const getRecommendationIcon = () => {
    switch (recommendation.recommendation) {
      case 'increase':
        return <TrendingUp sx={{ color: '#4caf50' }} />;
      case 'decrease':
        return <TrendingDown sx={{ color: '#f44336' }} />;
      case 'maintain':
        return <TrendingFlat sx={{ color: '#ff9800' }} />;
    }
  };

  const getRecommendationColor = () => {
    switch (recommendation.recommendation) {
      case 'increase':
        return '#4caf50';
      case 'decrease':
        return '#f44336';
      case 'maintain':
        return '#ff9800';
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.implementationPriority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
    }
  };

  const getTimeframeText = () => {
    switch (recommendation.timeframe) {
      case 'immediate':
        return 'Немедленно';
      case 'short_term':
        return 'Краткосрочно (1-2 недели)';
      case 'medium_term':
        return 'Среднесрочно (1-2 месяца)';
    }
  };

  return (
    <Card sx={{ mb: 2, border: `2px solid ${getRecommendationColor()}20`, borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {getRecommendationIcon()}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: getRecommendationColor() }}>
                {productData['наименование']} {productData['диаметр']}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {productData['марка_стали']} • {productData['регион']}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}>
              <IconButton 
                size="small" 
                onClick={() => onFavorite?.(recommendation)}
                sx={{ color: isFavorite ? '#ff9800' : 'inherit' }}
              >
                {isFavorite ? <Star /> : <StarBorder />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Реализовать рекомендацию">
              <IconButton 
                size="small" 
                onClick={() => onImplement?.(recommendation)}
                sx={{ color: getRecommendationColor() }}
              >
                <CheckCircle />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#292929' }}>
              {recommendation.currentPrice.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Текущая цена (руб/т)
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: getRecommendationColor() }}>
              {recommendation.recommendedPrice.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Рекомендуемая цена (руб/т)
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} mb={2} justifyContent="center">
          <Chip 
            label={`${recommendation.priceChangePercent > 0 ? '+' : ''}${recommendation.priceChangePercent.toFixed(1)}%`}
            color={recommendation.priceChangePercent > 0 ? 'success' : recommendation.priceChangePercent < 0 ? 'error' : 'warning'}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <Chip 
            label={recommendation.implementationPriority === 'high' ? 'Высокий приоритет' : 
                   recommendation.implementationPriority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
            sx={{ 
              bgcolor: getPriorityColor(), 
              color: 'white', 
              fontWeight: 700,
              '&:hover': { bgcolor: getPriorityColor() }
            }}
          />
          <Chip 
            label={`Уверенность: ${(recommendation.confidence * 100).toFixed(0)}%`}
            variant="outlined"
            icon={<Assessment />}
          />
        </Stack>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Временные рамки: {getTimeframeText()}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={recommendation.confidence * 100} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: getRecommendationColor()
              }
            }} 
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: recommendation.expectedImpact.volumeChange > 0 ? '#4caf50' : '#f44336' }}>
              {recommendation.expectedImpact.volumeChange > 0 ? '+' : ''}{recommendation.expectedImpact.volumeChange.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Изменение объема
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: recommendation.expectedImpact.revenueChange > 0 ? '#4caf50' : '#f44336' }}>
              {recommendation.expectedImpact.revenueChange > 0 ? '+' : ''}{recommendation.expectedImpact.revenueChange.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Изменение выручки
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: recommendation.expectedImpact.marketShareChange > 0 ? '#4caf50' : '#f44336' }}>
              {recommendation.expectedImpact.marketShareChange > 0 ? '+' : ''}{recommendation.expectedImpact.marketShareChange.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Доля рынка
            </Typography>
          </Box>
        </Box>

        {recommendation.reasoning.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Обоснование:
            </Typography>
            <List dense>
              {recommendation.reasoning.map((reason, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Info fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={reason}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {recommendation.risks.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Риски:
            </Typography>
            <List dense>
              {recommendation.risks.map((risk, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Warning fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={risk}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function PricingRecommendations({ filters }: PricingRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [implemented, setImplemented] = useState<Set<string>>(new Set());

  // Генерируем рекомендации на основе данных
  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Импортируем данные
      const { fetchRealMetalsPricingData } = await import('../data/realMetalsPricingData');
      const data = await fetchRealMetalsPricingData(1000, 0);
      
      const newRecommendations: PricingRecommendation[] = [];
      
      // Берем первые 20 записей для генерации рекомендаций
      const sampleData = data.records.slice(0, 20);
      
      for (const productData of sampleData) {
        if (!productData['цена'] || productData['цена'] <= 0) continue;
        
        // Создаем данные конкурентов (симуляция)
        const competitorPrices: CompetitorPrice[] = [
          {
            competitor: 'Конкурент 1',
            price: productData['цена'] * (0.95 + Math.random() * 0.1),
            region: productData['регион'],
            availability: 'в наличии',
            quality: 'standard',
            deliveryTime: 7
          },
          {
            competitor: 'Конкурент 2',
            price: productData['цена'] * (0.98 + Math.random() * 0.08),
            region: productData['регион'],
            availability: 'в наличии',
            quality: 'premium',
            deliveryTime: 5
          },
          {
            competitor: 'Конкурент 3',
            price: productData['цена'] * (0.92 + Math.random() * 0.12),
            region: productData['регион'],
            availability: 'под заказ',
            quality: 'budget',
            deliveryTime: 14
          }
        ];
        
        // Позиция на рынке
        const marketPosition: MarketPosition = {
          position: 'follower',
          marketShare: 15 + Math.random() * 10,
          brandStrength: 0.7 + Math.random() * 0.2
        };
        
        // Создаем алгоритм и генерируем рекомендацию
        const algorithm = PricingAlgorithmFactory.createForProduct(productData, competitorPrices, marketPosition);
        const recommendation = algorithm.generateRecommendation();
        
        newRecommendations.push(recommendation);
      }
      
      setRecommendations(newRecommendations);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(`Ошибка генерации рекомендаций: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [filters]);

  const handleImplement = (recommendation: PricingRecommendation) => {
    const key = `${recommendation.currentPrice}-${recommendation.recommendedPrice}`;
    setImplemented(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
  };

  const handleFavorite = (recommendation: PricingRecommendation) => {
    const key = `${recommendation.currentPrice}-${recommendation.recommendedPrice}`;
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(key)) {
        newFavorites.delete(key);
      } else {
        newFavorites.add(key);
      }
      return newFavorites;
    });
  };

  const getRecommendationStats = () => {
    const total = recommendations.length;
    const increase = recommendations.filter(r => r.recommendation === 'increase').length;
    const decrease = recommendations.filter(r => r.recommendation === 'decrease').length;
    const maintain = recommendations.filter(r => r.recommendation === 'maintain').length;
    const highPriority = recommendations.filter(r => r.implementationPriority === 'high').length;
    
    return { total, increase, decrease, maintain, highPriority };
  };

  const stats = getRecommendationStats();

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Генерация рекомендаций по ценам...</Typography>
        <LinearProgress sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <AlertTitle>Ошибка загрузки рекомендаций</AlertTitle>
        {error}
        <Button onClick={generateRecommendations} sx={{ mt: 1 }}>
          Попробовать снова
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Business sx={{ color: '#f57838', fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800 }}>
          Рекомендации по корректировке цен
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={generateRecommendations}
          sx={{ ml: 'auto' }}
        >
          Обновить
        </Button>
      </Stack>

      {/* Статистика */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5', flex: '1 1 200px', minWidth: '150px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#292929' }}>
            {stats.total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Всего рекомендаций
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8', flex: '1 1 200px', minWidth: '150px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#4caf50' }}>
            {stats.increase}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Повысить цену
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee', flex: '1 1 200px', minWidth: '150px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f44336' }}>
            {stats.decrease}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Снизить цену
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', flex: '1 1 200px', minWidth: '150px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#ff9800' }}>
            {stats.maintain}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Оставить без изменений
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec', flex: '1 1 200px', minWidth: '150px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#e91e63' }}>
            {stats.highPriority}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Высокий приоритет
          </Typography>
        </Paper>
      </Box>

      {/* Рекомендации */}
      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 700, mb: 2 }}>
        Рекомендации по продуктам ({recommendations.length})
      </Typography>

      {recommendations.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Нет рекомендаций</AlertTitle>
          Рекомендации будут сгенерированы после анализа данных о ценах конкурентов.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              recommendation={recommendation}
              productData={{} as RealMetalPricingRecord} // Заглушка, в реальном приложении нужно передавать реальные данные
              onImplement={handleImplement}
              onFavorite={handleFavorite}
              isFavorite={favorites.has(`${recommendation.currentPrice}-${recommendation.recommendedPrice}`)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default PricingRecommendations;
