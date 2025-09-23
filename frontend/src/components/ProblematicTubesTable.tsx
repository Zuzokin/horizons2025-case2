import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
  Tooltip
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fetchRealMetalsPricingData, getAveragePrice, getFilteredRecords, getProblematicTubesFromRealData, ProblematicTubeRecord } from '../data/realMetalsPricingData';
import { getPriceRecommendation, updateProductPrice } from '../api';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface ProblematicTubesTableProps {
  onTubeSelect: (tubeData: any) => void;
  filters: FilterState;
}

function ProblematicTubesTable({ onTubeSelect, filters }: ProblematicTubesTableProps) {
  const [realData, setRealData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [recommendations, setRecommendations] = React.useState<Map<string, any>>(new Map());
  const [applyingRecommendations, setApplyingRecommendations] = React.useState<Set<string>>(new Set());
  const [applyingAll, setApplyingAll] = React.useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = React.useState<Set<string>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading data in ProblematicTubesTable...');
        const data = await fetchRealMetalsPricingData(1000, 0);
        console.log('Data loaded:', data);
        console.log('Records count:', data.records?.length || 0);
        setRealData(data);
        
        // Загружаем рекомендации для всех труб
        await loadRecommendations(data);
      } catch (err) {
        console.error('Error loading real data:', err);
        setError(`Ошибка загрузки данных: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadRecommendations = async (data: any) => {
    if (!data?.records) return;
    
    try {
      const tubes = getProblematicTubesFromRealData(data.records);
      // Ограничиваем количество труб до 10 для улучшения производительности
      const limitedTubes = tubes.slice(0, 10);
      const newRecommendations = new Map();
      
      console.log(`Loading recommendations for ${limitedTubes.length} tubes (limited from ${tubes.length})`);
      
      // Логируем разнообразие данных
      console.log('Data diversity analysis:', {
        total_tubes: tubes.length,
        limited_tubes: limitedTubes.length,
        product_types: Array.from(new Set(tubes.map(t => t['вид_продукции']))),
        warehouses: Array.from(new Set(tubes.map(t => t['склад']))),
        steel_grades: Array.from(new Set(tubes.map(t => t['марка_стали']))),
        regions: Array.from(new Set(tubes.map(t => t['регион']))),
        price_range: {
          min: Math.min(...tubes.map(t => t['цена'])),
          max: Math.max(...tubes.map(t => t['цена'])),
          avg: tubes.reduce((sum, t) => sum + t['цена'], 0) / tubes.length
        }
      });
      
      for (const tube of limitedTubes) {
        try {
          // Определяем вид продукции на основе названия
          const getProductType = (name: string) => {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('арматура')) return 'арматура';
            if (lowerName.includes('труба')) return 'труба';
            if (lowerName.includes('уголок')) return 'уголок';
            if (lowerName.includes('швеллер')) return 'швеллер';
            if (lowerName.includes('балка')) return 'балка';
            if (lowerName.includes('лист')) return 'лист';
            if (lowerName.includes('проволока')) return 'проволока';
            return 'труба'; // по умолчанию
          };

          // Отправляем всю информацию о трубе для получения рекомендации
          const tubeData = {
            // Основная информация о продукте (с fallback значениями)
            вид_продукции: tube['вид_продукции'] || getProductType(tube['наименование']),
            наименование: tube['наименование'],
            марка_стали: tube['марка_стали'] || 'Ст3',
            диаметр: tube['диаметр'],
            ГОСТ: tube['ГОСТ'],
            
            // Ценовая информация
            цена: tube['цена'],
            цена_за_тонну: tube['цена'],
            
            // Информация о поставке
            склад: tube['склад'],
            наличие: tube['наличие'],
            производитель: tube['производитель'] || 'Неизвестно',
            регион: tube['регион'] || 'Москва',
            
            // Дополнительная информация
            длина: (tube as any)['длина'] || null,
            толщина_стенки: (tube as any)['толщина_стенки'] || null,
            вес: (tube as any)['вес'] || null,
            объем: (tube as any)['объем'] || null,
            
            // Метаданные
            id: tube.id || `${tube['наименование']}-${tube['диаметр']}`,
            дата_обновления: new Date().toISOString(),
            источник_данных: 'frontend'
          };
          
          console.log('Sending tube data for recommendation:', tubeData);
          console.log('Tube sample data:', {
            наименование: tube['наименование'],
            вид_продукции: tube['вид_продукции'],
            марка_стали: tube['марка_стали'],
            диаметр: tube['диаметр'],
            ГОСТ: tube['ГОСТ'],
            цена: tube['цена'],
            склад: tube['склад'],
            наличие: tube['наличие'],
            производитель: tube['производитель'],
            регион: tube['регион']
          });
          const recommendation = await getPriceRecommendation(tubeData);
          
          console.log('Received recommendation for:', tube['наименование'], recommendation);
          console.log('Recommendation details:', {
            new_price: recommendation.decision?.new_price,
            action: recommendation.decision?.action,
            delta_percent: recommendation.decision?.delta_percent,
            confidence: recommendation.confidence,
            explain: recommendation.explain
          });
          
          newRecommendations.set(`${tube['наименование']}-${tube['диаметр']}`, recommendation);
        } catch (err) {
          console.error('Error getting recommendation for tube:', tube['наименование'], err);
        }
      }
      
      setRecommendations(newRecommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  const handleApplyRecommendation = async (tube: ProblematicTubeRecord) => {
    const key = `${tube['наименование']}-${tube['диаметр']}`;
    const recommendation = recommendations.get(key);
    
    if (!recommendation) return;
    
    try {
      setApplyingRecommendations(prev => new Set(prev).add(key));
      
      await updateProductPrice({
        product_id: tube.id || key,
        recommended_price: recommendation.decision?.new_price || recommendation.new_price || recommendation.recommended_price,
        reason: recommendation.explain || recommendation.reason || 'Применена рекомендация системы'
      });
      
      // Отмечаем рекомендацию как примененную
      setAppliedRecommendations(prev => new Set(prev).add(key));
      
      // Показываем сообщение об успехе
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Обновляем данные после применения рекомендации
      const updatedData = await fetchRealMetalsPricingData(1000, 0);
      setRealData(updatedData);
      
      console.log('Recommendation applied successfully for:', tube['наименование']);
    } catch (err) {
      console.error('Error applying recommendation:', err);
    } finally {
      setApplyingRecommendations(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const handleApplyAllRecommendations = async () => {
    if (!realData?.records) return;
    
    try {
      setApplyingAll(true);
      const tubes = getProblematicTubesFromRealData(realData.records);
      // Ограничиваем количество труб до 10 для применения рекомендаций
      const limitedTubes = tubes.slice(0, 10);
      
      console.log(`Applying recommendations to ${limitedTubes.length} tubes (limited from ${tubes.length})`);
      
      for (const tube of limitedTubes) {
        const key = `${tube['наименование']}-${tube['диаметр']}`;
        const recommendation = recommendations.get(key);
        
        if (recommendation) {
          try {
            await updateProductPrice({
              product_id: tube.id || key,
              recommended_price: recommendation.decision?.new_price || recommendation.new_price || recommendation.recommended_price,
              reason: recommendation.explain || recommendation.reason || 'Применена рекомендация системы'
            });
            
            // Отмечаем рекомендацию как примененную
            setAppliedRecommendations(prev => new Set(prev).add(key));
          } catch (err) {
            console.error('Error applying recommendation for:', tube['наименование'], err);
          }
        }
      }
      
      // Показываем сообщение об успехе для всех рекомендаций
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Обновляем данные после применения всех рекомендаций
      const updatedData = await fetchRealMetalsPricingData(1000, 0);
      setRealData(updatedData);
      
      console.log('All recommendations applied successfully');
    } catch (err) {
      console.error('Error applying all recommendations:', err);
    } finally {
      setApplyingAll(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress sx={{ color: '#f57838' }} />
      </Box>
    );
  }

  if (error || !realData) {
    return (
      <Alert severity="error" sx={{ borderRadius: 4 }}>
        <AlertTitle>Ошибка загрузки данных</AlertTitle>
        {error || 'Не удалось загрузить данные о ценах'}
      </Alert>
    );
  }

  // Применяем фильтры к данным и определяем проблемные трубы
  console.log('🔍 Applying filters:', filters);
  console.log('🔍 Raw records count:', realData.records?.length || 0);
  
  const filteredRecords = getFilteredRecords(realData.records, filters);
  console.log('🔍 Filtered records count:', filteredRecords.length);
  
  // Временно показываем первые несколько записей для отладки
  if (filteredRecords.length > 0) {
    console.log('🔍 First few filtered records:', filteredRecords.slice(0, 3).map(r => ({
      name: r['наименование'],
      type: r['вид_продукции'],
      price: r['цена']
    })));
  }
  
  const avgPrice = getAveragePrice(realData.records);
  
  const problematicTubes: ProblematicTubeRecord[] = getProblematicTubesFromRealData(filteredRecords);
  console.log('🔍 Problematic tubes count:', problematicTubes.length);
  
  // Временно показываем первые несколько проблемных труб для отладки
  if (problematicTubes.length > 0) {
    console.log('🔍 First few problematic tubes:', problematicTubes.slice(0, 3).map(t => ({
      name: t['наименование'],
      type: t['вид_продукции'],
      price: t['цена'],
      problemStatus: t.problemStatus
    })));
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#616161';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'high':
        return 'Высокий риск';
      case 'medium':
        return 'Средний риск';
      case 'low':
        return 'Низкий риск';
      default:
        return 'Стабильно';
    }
  };

  // Подсчет статистики
  const highRiskCount = problematicTubes.filter(tube => tube.problemStatus === 'high').length;
  const mediumRiskCount = problematicTubes.filter(tube => tube.problemStatus === 'medium').length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <WarningIcon sx={{ color: '#f57838', fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800 }}>
          Мониторинг труб - Диагностика (все записи)
        </Typography>
      </Stack>

      {/* Статистика */}
      <Stack direction="row" spacing={2} mb={3}>
        <Alert severity="error" sx={{ flex: 1 }}>
          <AlertTitle>Высокий приоритет</AlertTitle>
          {highRiskCount} труб требуют немедленного внимания
        </Alert>
        <Alert severity="warning" sx={{ flex: 1 }}>
          <AlertTitle>Средний приоритет</AlertTitle>
          {mediumRiskCount} труб требуют мониторинга
        </Alert>
      </Stack>

      {/* Сообщение об успешном применении рекомендаций */}
      {showSuccessMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setShowSuccessMessage(false)}
        >
          <AlertTitle>Рекомендации применены!</AlertTitle>
          Цены успешно обновлены согласно рекомендациям системы.
        </Alert>
      )}

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
        Список труб (показано {Math.min(problematicTubes.length, 10)} из {problematicTubes.length} позиций)
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
        <AlertTitle>Режим диагностики</AlertTitle>
        Временно отключена фильтрация для диагностики проблемы с отображением труб. Проверьте консоль браузера для деталей.
      </Alert>
      
      {/* Кнопка применения всех рекомендаций */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={applyingAll ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          onClick={handleApplyAllRecommendations}
          disabled={applyingAll || recommendations.size === 0}
          sx={{
            bgcolor: '#4caf50',
            '&:hover': { bgcolor: '#45a049' },
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            px: 3
          }}
        >
          {applyingAll ? 'Применяем...' : `Применить все рекомендации (${Math.min(recommendations.size, 10)})`}
        </Button>
        
        {/* Показываем количество примененных рекомендаций */}
        {appliedRecommendations.size > 0 && (
          <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600, mt: 1 }}>
            ✅ Применено рекомендаций: {appliedRecommendations.size}
          </Typography>
        )}
      </Box>
      
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 4, mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>№</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Наименование</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Вид продукции</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Склад</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Марка стали</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Диаметр</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>ГОСТ</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Цена (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Рекомендованная цена</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Наличие</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Проблема</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {problematicTubes.slice(0, 10).map((row, index) => (
              <TableRow 
                key={`${row['наименование']}-${index}`} 
                hover 
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(245, 120, 56, 0.04)' }
                }}
                onClick={() => onTubeSelect(row)}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell sx={{ color: '#292929', fontWeight: 600 }}>
                  {row['наименование']}
                </TableCell>
                        <TableCell>
                          <Chip
                            label={row['вид_продукции']}
                            size="small"
                            sx={{
                              bgcolor: '#f0f0f0',
                              color: '#292929',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>{row['склад']}</TableCell>
                        <TableCell>{row['марка_стали']}</TableCell>
                <TableCell>{row['диаметр']}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{row['ГОСТ']}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {row['цена'] ? row['цена'].toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  {(() => {
                    const key = `${row['наименование']}-${row['диаметр']}`;
                    const recommendation = recommendations.get(key);
                    if (!recommendation) return 'Загрузка...';
                    
                    const recommendedPrice = recommendation.decision?.new_price || 
                                           recommendation.new_price || 
                                           recommendation.recommended_price || 
                                           recommendation.price || 
                                           recommendation.optimal_price ||
                                           recommendation.suggested_price;
                    const currentPrice = row['цена'] || 0;
                    const priceDiff = recommendedPrice - currentPrice;
                    const priceDiffPercent = currentPrice > 0 ? (priceDiff / currentPrice) * 100 : 0;
                    const isApplied = appliedRecommendations.has(`${row['наименование']}-${row['диаметр']}`);
                    
                    return (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: isApplied ? '#4caf50' : 'inherit',
                          backgroundColor: isApplied ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                          padding: isApplied ? '4px 8px' : '0',
                          borderRadius: isApplied ? '4px' : '0',
                          border: isApplied ? '1px solid #4caf50' : 'none'
                        }}
                      >
                        {recommendedPrice ? recommendedPrice.toLocaleString() : 'N/A'} ₽/т
                        {isApplied && (
                          <Typography component="span" variant="caption" sx={{ ml: 1, color: '#4caf50' }}>
                            ✅
                          </Typography>
                        )}
                      </Typography>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row['наличие']}
                    size="small"
                    sx={{
                      bgcolor: row['наличие'].includes('в наличии') ? '#e8f5e9' : 
                               row['наличие'].includes('мало') ? '#fff3e0' : '#ffebee',
                      color: row['наличие'].includes('в наличии') ? '#4caf50' : 
                             row['наличие'].includes('мало') ? '#ff9800' : '#f44336',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  {row.problemDescription}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(row.problemStatus)}
                    sx={{
                      bgcolor: getStatusColor(row.problemStatus),
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {(() => {
                      const key = `${row['наименование']}-${row['диаметр']}`;
                      const recommendation = recommendations.get(key);
                      const isApplying = applyingRecommendations.has(key);
                      const isApplied = appliedRecommendations.has(key);
                      
                      if (!recommendation) return null;
                      
                      return (
                        <Tooltip title={isApplied ? 'Рекомендация уже применена' : `Применить рекомендованную цену: ${recommendation.decision?.new_price || recommendation.new_price || recommendation.recommended_price || recommendation.price || recommendation.optimal_price || recommendation.suggested_price} ₽/т`}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={isApplied ? <CheckCircleIcon /> : (isApplying ? <CircularProgress size={16} /> : <CheckIcon />)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isApplied) {
                                handleApplyRecommendation(row);
                              }
                            }}
                            disabled={isApplying || isApplied}
                            sx={{
                              bgcolor: isApplied ? '#4caf50' : '#4caf50',
                              '&:hover': { bgcolor: isApplied ? '#4caf50' : '#45a049' },
                              color: '#fff',
                              fontWeight: 700,
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              opacity: isApplied ? 0.7 : 1
                            }}
                          >
                            {isApplied ? 'Применено' : (isApplying ? 'Применяем...' : 'Применить')}
                          </Button>
                        </Tooltip>
                      );
                    })()}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ProblematicTubesTable;
