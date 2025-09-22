import React from 'react';
import { Box, Typography, Paper, Stack, Card, CardContent, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface MarketOverviewProps {
  filters: FilterState;
}

const mockMarketTrendData = [
  { name: 'Нед 1', Цена: 75000 },
  { name: 'Нед 2', Цена: 75500 },
  { name: 'Нед 3', Цена: 74800 },
  { name: 'Нед 4', Цена: 76200 },
  { name: 'Нед 5', Цена: 77000 },
  { name: 'Нед 6', Цена: 76500 },
];

const mockDemandSupplyData = [
  { name: 'Труба А', Спрос: 1200, Предложение: 1500 },
  { name: 'Труба Б', Спрос: 1500, Предложение: 1300 },
  { name: 'Труба В', Спрос: 900, Предложение: 1000 },
  { name: 'Труба Г', Спрос: 1100, Предложение: 1200 },
];

function MarketOverview({ filters }: MarketOverviewProps) {
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
        <TrendingUpIcon sx={{ color: '#f57838', fontSize: 36 }} />
        <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1 }}>
          Обзор рынка металлопродукции{getActiveFiltersText()}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} mb={4}>
        <Card sx={{ flex: 1, p: 2, borderRadius: 4, boxShadow: 3, bgcolor: '#f57838', color: '#fff' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <AttachMoneyIcon />
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Средняя цена по рынку</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>76 500 руб/т</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>+1.2% за неделю</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, p: 2, borderRadius: 4, boxShadow: 3, bgcolor: '#292929', color: '#fff' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <StoreIcon />
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Объем складских остатков</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>15 200 т</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>-0.5% за неделю</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, p: 2, borderRadius: 4, boxShadow: 3, bgcolor: '#c8c8c8', color: '#292929' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <PeopleIcon />
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Активность конкурентов</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Высокая</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>3 изменения цен за 24ч</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} mb={4}>
        <Paper elevation={2} sx={{ flex: 1, p: 3, borderRadius: 4, bgcolor: '#f8f8f8', boxSizing: 'border-box', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <TrendingUpIcon sx={{ color: '#f57838' }} />
            <Typography variant="subtitle1" sx={{ color: '#292929', fontWeight: 700 }}>Тренды цен на рынке</Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockMarketTrendData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Цена" stroke="#f57838" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper elevation={2} sx={{ flex: 1, p: 3, borderRadius: 4, bgcolor: '#f8f8f8', boxSizing: 'border-box', overflow: 'hidden' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <StoreIcon sx={{ color: '#f57838' }} />
            <Typography variant="subtitle1" sx={{ color: '#292929', fontWeight: 700 }}>Спрос и предложение по категориям</Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockDemandSupplyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Спрос" fill="#f57838" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Предложение" fill="#292929" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Stack>
    </Box>
  );
}

export default MarketOverview;