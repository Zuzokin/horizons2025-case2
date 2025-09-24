import React from 'react';
import { Box, Typography, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StorageIcon from '@mui/icons-material/Storage';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { fetchRealMetalsPricingData, getFilteredRecords, getAveragePrice, getPriceRange } from '../data/realMetalsPricingData';
import DataStatusIndicator from './DataStatusIndicator';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface PriceAnalyticsProps {
  filters: FilterState;
}

const mockPriceData = [
  { name: 'Янв', ТМК: 1000, Конкурент1: 1020, Конкурент2: 1010 },
  { name: 'Фев', ТМК: 1050, Конкурент1: 1070, Конкурент2: 1060 },
  { name: 'Мар', ТМК: 1030, Конкурент1: 1050, Конкурент2: 1040 },
  { name: 'Апр', ТМК: 1080, Конкурент1: 1100, Конкурент2: 1090 },
  { name: 'Май', ТМК: 1120, Конкурент1: 1140, Конкурент2: 1130 },
  { name: 'Июн', ТМК: 1100, Конкурент1: 1120, Конкурент2: 1110 },
];

const mockStockData = [
  { name: 'Труба А', В_наличии: 1200, Спрос: 800 },
  { name: 'Труба Б', В_наличии: 800, Спрос: 1000 },
  { name: 'Труба В', В_наличии: 1500, Спрос: 700 },
  { name: 'Труба Г', В_наличии: 900, Спрос: 1100 },
];

function PriceAnalytics({ filters }: PriceAnalyticsProps) {
  const [realData, setRealData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading real data for PriceAnalytics...');
        const data = await fetchRealMetalsPricingData(1000, 0);
        console.log('✅ Real data loaded for PriceAnalytics:', data);
        setRealData(data);
      } catch (error) {
        console.error('❌ Error loading real data for PriceAnalytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  if (loading || !realData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress sx={{ color: '#f57838' }} />
      </Box>
    );
  }

  const filteredProducts = getFilteredRecords(realData.records, filters);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AnalyticsIcon sx={{ color: '#f57838', fontSize: 36 }} />
          <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1 }}>
            Детальная аналитика цен{getActiveFiltersText()}
          </Typography>
        </Stack>
        
        <DataStatusIndicator 
          isMockData={realData.is_mock_data}
          lastUpdate={realData.generated_at}
          recordCount={realData.total_count}
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} mb={4}>
        <Paper elevation={2} sx={{ flex: 1, p: 3, borderRadius: 4, bgcolor: '#f8f8f8', boxSizing: 'border-box', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <TrendingUpIcon sx={{ color: '#f57838' }} />
            <Typography variant="subtitle1" sx={{ color: '#292929', fontWeight: 700 }}>Динамика цен (ТМК vs Конкуренты)</Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockPriceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTMKAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f57838" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#f57838" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCompetitor1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorCompetitor2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
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
                fill="url(#colorTMKAnalytics)" 
                dot={{ fill: '#f57838', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f57838', strokeWidth: 3, fill: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="Конкурент1" 
                stroke="#2563eb" 
                strokeWidth={3}
                fill="url(#colorCompetitor1)" 
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 3, fill: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="Конкурент2" 
                stroke="#059669" 
                strokeWidth={3}
                fill="url(#colorCompetitor2)" 
                dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#059669', strokeWidth: 3, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        <Paper elevation={2} sx={{ flex: 1, p: 3, borderRadius: 4, bgcolor: '#f8f8f8', boxSizing: 'border-box', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <StorageIcon sx={{ color: '#f57838' }} />
            <Typography variant="subtitle1" sx={{ color: '#292929', fontWeight: 700 }}>Складские остатки и спрос</Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockStockData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="В_наличии" fill="#f57838" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Спрос" fill="#292929" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Stack>

              <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 2 }}>
                Цены по основным продуктам ({filteredProducts.length} из {realData.records.length})
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
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Наличие</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Производитель</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                    {filteredProducts.map((row, index) => (
                      <TableRow key={`${row['наименование']}-${index}`} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ color: '#292929', fontWeight: 600 }}>{row['наименование']}</TableCell>
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
                        <TableCell sx={{ fontWeight: 600 }}>{row['цена'] ? row['цена'].toLocaleString() : 'N/A'}</TableCell>
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
                        <TableCell>{row['производитель']}</TableCell>
                      </TableRow>
                    ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default PriceAnalytics;