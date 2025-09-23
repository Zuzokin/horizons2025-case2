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
  CircularProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { fetchRealMetalsPricingData, getAveragePrice, getFilteredRecords, getProblematicTubesFromRealData, ProblematicTubeRecord } from '../data/realMetalsPricingData';

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

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading data in ProblematicTubesTable...');
                const data = await fetchRealMetalsPricingData(1000, 0);
        console.log('Data loaded successfully:', data);
        setRealData(data);
      } catch (err) {
        console.error('Error loading real data:', err);
        setError(`Ошибка загрузки данных: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
  const filteredRecords = getFilteredRecords(realData.records, filters);
  const avgPrice = getAveragePrice(realData.records);
  
  const problematicTubes: ProblematicTubeRecord[] = getProblematicTubesFromRealData(filteredRecords);


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

  const highRiskCount = problematicTubes.filter(t => t.problemStatus === 'high').length;
  const mediumRiskCount = problematicTubes.filter(t => t.problemStatus === 'medium').length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <WarningIcon sx={{ color: '#f57838', fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800 }}>
          Мониторинг труб - Все позиции
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

      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
        Список всех труб ({problematicTubes.length} позиций)
      </Typography>
      
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
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Отклонение от рынка</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Наличие</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Проблема</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {problematicTubes.map((row, index) => (
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
                <TableCell sx={{ 
                  color: (row.priceDiffPercent || 0) > 0 ? '#f44336' : '#4caf50', 
                  fontWeight: 600 
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {(row.priceDiffPercent || 0) > 0 ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    {(row.priceDiffPercent || 0) > 0 ? '+' : ''}{(row.priceDiffPercent || 0).toFixed(1)}%
                  </Stack>
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
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTubeSelect(row);
                    }}
                    sx={{
                      bgcolor: '#f57838',
                      '&:hover': { bgcolor: '#ff8c38' },
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 2,
                      fontSize: '0.75rem'
                    }}
                  >
                    Анализ
                  </Button>
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
