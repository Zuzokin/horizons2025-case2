import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getMarketData, getPriceRecommendation } from '../api';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface TubeMarketOverviewProps {
  filters: FilterState;
  tubeData?: any; // Добавляем данные о трубе для получения рекомендаций
}

// Единые данные для конкурентов
const competitorData = [
  {
    id: 'TMK',
    name: 'ТМК',
    currentPrice: 75000,
    change: '-0.67%',
    status: 'current',
    recommendation: 'Рассмотреть снижение цены'
  },
  {
    id: 'SEVERSTAL',
    name: 'Северсталь',
    currentPrice: 76000,
    change: '+1.0%',
    status: 'competitor',
    recommendation: 'Цена выше рыночной'
  },
  {
    id: 'NLMK',
    name: 'НЛМК',
    currentPrice: 74500,
    change: '-0.2%',
    status: 'competitor',
    recommendation: 'Конкурентное преимущество'
  },
  {
    id: 'MMK',
    name: 'ММК',
    currentPrice: 78000,
    change: '+1.5%',
    status: 'competitor',
    recommendation: 'Цена значительно выше'
  },
];

// Данные для графика динамики цен с более заметными различиями
const mockPriceData = [
  { name: 'Янв', ТМК: 72000, Северсталь: 75000, НЛМК: 73000, ММК: 78000 },
  { name: 'Фев', ТМК: 73500, Северсталь: 76000, НЛМК: 74000, ММК: 79000 },
  { name: 'Мар', ТМК: 74000, Северсталь: 76500, НЛМК: 74200, ММК: 80000 },
  { name: 'Апр', ТМК: 74500, Северсталь: 76800, НЛМК: 74400, ММК: 80500 },
  { name: 'Май', ТМК: 74800, Северсталь: 76900, НЛМК: 74450, ММК: 80800 },
  { name: 'Июн', ТМК: 75000, Северсталь: 76000, НЛМК: 74500, ММК: 78000 },
];

function TubeMarketOverview({ filters, tubeData }: TubeMarketOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [competitorData, setCompetitorData] = useState<any[]>([]);
  const [priceData, setPriceData] = useState<any[]>([]);

  useEffect(() => {
    loadMarketData();
  }, [filters, tubeData]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем рыночные данные
      const market = await getMarketData();
      setMarketData(market);

      // Формируем данные конкурентов из рыночных данных
      if (market.competitors) {
        const competitors = market.competitors.map((comp: any, index: number) => ({
          id: comp.id || `competitor_${index}`,
          name: comp.name || 'Неизвестно',
          currentPrice: comp.price || 0,
          change: comp.change || '0%',
          status: comp.status || 'competitor',
          recommendation: comp.recommendation || 'Нет рекомендации'
        }));
        setCompetitorData(competitors);
      } else {
        // Fallback к моковым данным если нет реальных
        setCompetitorData([
          {
            id: 'TMK',
            name: 'ТМК',
            currentPrice: 75000,
            change: '-0.67%',
            status: 'current',
            recommendation: 'Рассмотреть снижение цены'
          },
          {
            id: 'SEVERSTAL',
            name: 'Северсталь',
            currentPrice: 76000,
            change: '+1.0%',
            status: 'competitor',
            recommendation: 'Цена выше рыночной'
          },
          {
            id: 'NLMK',
            name: 'НЛМК',
            currentPrice: 74500,
            change: '-0.2%',
            status: 'competitor',
            recommendation: 'Конкурентное преимущество'
          },
          {
            id: 'MMK',
            name: 'ММК',
            currentPrice: 78000,
            change: '+1.5%',
            status: 'competitor',
            recommendation: 'Цена значительно выше'
          }
        ]);
      }

      // Формируем данные для графика
      if (market.price_history) {
        setPriceData(market.price_history);
      } else {
        // Fallback к моковым данным
        setPriceData([
          { name: 'Янв', ТМК: 72000, Северсталь: 75000, НЛМК: 73000, ММК: 78000 },
          { name: 'Фев', ТМК: 73500, Северсталь: 76000, НЛМК: 74000, ММК: 79000 },
          { name: 'Мар', ТМК: 74000, Северсталь: 76500, НЛМК: 74200, ММК: 80000 },
          { name: 'Апр', ТМК: 74500, Северсталь: 76800, НЛМК: 74400, ММК: 80500 },
          { name: 'Май', ТМК: 74800, Северсталь: 76900, НЛМК: 74450, ММК: 80800 },
          { name: 'Июн', ТМК: 75000, Северсталь: 76000, НЛМК: 74500, ММК: 78000 }
        ]);
      }

    } catch (err) {
      console.error('Error loading market data:', err);
      setError(`Ошибка загрузки данных: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      
      // Fallback к моковым данным при ошибке
      setCompetitorData([
        {
          id: 'TMK',
          name: 'ТМК',
          currentPrice: 75000,
          change: '-0.67%',
          status: 'current',
          recommendation: 'Рассмотреть снижение цены'
        },
        {
          id: 'SEVERSTAL',
          name: 'Северсталь',
          currentPrice: 76000,
          change: '+1.0%',
          status: 'competitor',
          recommendation: 'Цена выше рыночной'
        },
        {
          id: 'NLMK',
          name: 'НЛМК',
          currentPrice: 74500,
          change: '-0.2%',
          status: 'competitor',
          recommendation: 'Конкурентное преимущество'
        },
        {
          id: 'MMK',
          name: 'ММК',
          currentPrice: 78000,
          change: '+1.5%',
          status: 'competitor',
          recommendation: 'Цена значительно выше'
        }
      ]);
      
      setPriceData([
        { name: 'Янв', ТМК: 72000, Северсталь: 75000, НЛМК: 73000, ММК: 78000 },
        { name: 'Фев', ТМК: 73500, Северсталь: 76000, НЛМК: 74000, ММК: 79000 },
        { name: 'Мар', ТМК: 74000, Северсталь: 76500, НЛМК: 74200, ММК: 80000 },
        { name: 'Апр', ТМК: 74500, Северсталь: 76800, НЛМК: 74400, ММК: 80500 },
        { name: 'Май', ТМК: 74800, Северсталь: 76900, НЛМК: 74450, ММК: 80800 },
        { name: 'Июн', ТМК: 75000, Северсталь: 76000, НЛМК: 74500, ММК: 78000 }
      ]);
    } finally {
      setLoading(false);
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

  const handleApplyRecommendation = async (id: string) => {
    if (!tubeData) {
      alert('Нет данных о трубе для применения рекомендации');
      return;
    }

    try {
      const recommendation = await getPriceRecommendation({
        вид_продукции: tubeData['вид_продукции'] || 'труба',
        склад: tubeData['склад'] || 'Москва',
        наименование: tubeData['наименование'] || '',
        марка_стали: tubeData['марка_стали'] || 'Ст3',
        диаметр: tubeData['диаметр'] || '',
        ГОСТ: tubeData['ГОСТ'] || '',
        цена: tubeData['цена'] || 0,
        производитель: tubeData['производитель'] || 'Неизвестно',
        регион: tubeData['регион'] || 'Москва'
      });

      alert(`Рекомендация применена для ${id}. Новая цена: ${recommendation.decision?.new_price || 'N/A'} ₽/т`);
    } catch (err) {
      console.error('Error applying recommendation:', err);
      alert(`Ошибка применения рекомендации: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    }
  };

  // Вычисляем среднюю цену рынка
  const averageMarketPrice = competitorData.length > 0 
    ? Math.round(competitorData.reduce((sum, comp) => sum + comp.currentPrice, 0) / competitorData.length)
    : 76500;

  // Вычисляем объем складских остатков (моковые данные)
  const stockVolume = marketData?.stock_volume || 15200;

  // Вычисляем активность конкурентов
  const competitorActivity = competitorData.filter(comp => comp.change !== '0%').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <AlertTitle>Ошибка загрузки данных</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box>

      {/* Ключевые показатели */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, p: 1.5, borderRadius: 3, boxShadow: 2, bgcolor: '#f57838', color: '#fff' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <AttachMoneyIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>Средняя цена по рынку</Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{averageMarketPrice.toLocaleString()} ₽/т</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>+1.2% за неделю</Typography>
        </Card>
        <Card sx={{ flex: 1, p: 1.5, borderRadius: 3, boxShadow: 2, bgcolor: '#292929', color: '#fff' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <StoreIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>Объем складских остатков</Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{stockVolume.toLocaleString()} т</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>-0.5% за неделю</Typography>
        </Card>
        <Card sx={{ flex: 1, p: 1.5, borderRadius: 3, boxShadow: 2, bgcolor: '#c8c8c8', color: '#292929' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <PeopleIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>Активность конкурентов</Typography>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            {competitorActivity > 2 ? 'Высокая' : competitorActivity > 0 ? 'Средняя' : 'Низкая'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
            {competitorActivity} изменений за 24ч
          </Typography>
        </Card>
      </Stack>

      {/* Таблица "Сравнение цен и рекомендации по корректировке" */}
      <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
        Сравнение цен и рекомендации по корректировке
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 4, mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Продукт</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Производитель</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Цена (руб/т)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Изменение за 24ч</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Рекомендация</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {competitorData.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ color: '#292929', fontWeight: 700 }}>Труба стальная ⌀57х3.5</TableCell>
                <TableCell>
                  <Chip
                    label={row.name}
                    sx={{
                      bgcolor: row.status === 'current' ? '#f57838' : '#e0e0e0',
                      color: row.status === 'current' ? '#fff' : '#292929',
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.currentPrice ? row.currentPrice.toLocaleString() : 'N/A'}</TableCell>
                <TableCell sx={{ color: row.change.includes('+') ? 'green' : 'red', fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {row.change.includes('+') ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    {row.change}
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{row.recommendation}</TableCell>
                <TableCell>
                  {row.status === 'current' && (
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

      {/* График динамики цен */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8f8f8', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <TrendingUpIcon sx={{ color: '#f57838', fontSize: 20 }} />
          <Typography variant="body1" sx={{ color: '#292929', fontWeight: 700, fontSize: '0.9rem' }}>Динамика цен (ТМК vs Конкуренты)</Typography>
        </Stack>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={mockPriceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f57838" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#f57838" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSeverstal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorNLMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorMMK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ddd' }}
            />
            <YAxis 
              fontSize={12} 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ddd' }}
              domain={['dataMin - 2000', 'dataMax + 2000']}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value, name) => [`${value.toLocaleString()} ₽/т`, name]}
              labelFormatter={(label) => `Месяц: ${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
            />
            <Area 
              type="monotone" 
              dataKey="ТМК" 
              stroke="#f57838" 
              strokeWidth={3}
              fill="url(#colorTMK)" 
              dot={{ fill: '#f57838', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f57838', strokeWidth: 3, fill: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="Северсталь" 
              stroke="#2563eb" 
              strokeWidth={3}
              fill="url(#colorSeverstal)" 
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 3, fill: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="НЛМК" 
              stroke="#059669" 
              strokeWidth={3}
              fill="url(#colorNLMK)" 
              dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#059669', strokeWidth: 3, fill: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="ММК" 
              stroke="#dc2626" 
              strokeWidth={3}
              fill="url(#colorMMK)" 
              dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 3, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}

export default TubeMarketOverview;
