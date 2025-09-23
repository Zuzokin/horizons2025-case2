import { Box, Typography, Paper, Stack, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent, Avatar, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FactoryIcon from '@mui/icons-material/Factory';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import React, { useRef, useEffect, useState } from 'react';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import OrderHistoryModal from './OrderHistoryModal';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BrushIcon from '@mui/icons-material/Brush';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { getTnsByContrpartner, getTnsByMonths, getTnsBySuppliers, getSaleDocumentsByContrpartner, getFrequentlyAssortment, getAprioriAssortment, getFrequentlyAssortmentByContrpartner } from '../api';

const COLORS = ['#f57838', '#292929', '#c8c8c8', '#ffd6b3'];

const MainAnalytics = ({ client }: { client?: any }) => {
  const topRef = useRef<HTMLDivElement>(null);
  const [recView, setRecView] = React.useState<'table' | 'cards'>('table');
  const [topView, setTopView] = React.useState<'table' | 'cards'>('table');
  const [historyOpen, setHistoryOpen] = React.useState(false);
  // Новые состояния для статистики
  const [yearVolume, setYearVolume] = useState<number | null>(null);
  const [monthlyVolumes, setMonthlyVolumes] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [frequentlyProducts, setFrequentlyProducts] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [regionalProducts, setRegionalProducts] = useState<any[]>([]);
  const [regionalView, setRegionalView] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    if (!client?.id) return;
    setLoadingStats(true);
    Promise.all([
      getTnsByContrpartner(client.id),
      getTnsByMonths(client.id),
      getTnsBySuppliers(client.id),
      getFrequentlyAssortment(client.id)
    ]).then(([year, months, supps, freq]) => {
      // Объем закупок (год) — универсальная обработка
      setYearVolume(
        typeof year === 'object' && year !== null && 'value' in year
          ? year.value
          : year ?? null
      );

      // Преобразуем месяцы
      const monthsArr = Array.isArray(months)
        ? months.map((m: any) => m.value
          ? {
              period: getMonthName(m.value.month),
              value: m.value.tns
            }
          : null
        ).filter(Boolean)
        : [];
      setMonthlyVolumes(monthsArr);

      // Преобразуем поставщиков
      const suppArr = Array.isArray(supps)
        ? supps.map((s: any) => s.value
          ? {
              name: s.value.supplier,
              value: s.value.tns
            }
          : null
        ).filter(Boolean)
        : [];
      setSuppliers(suppArr);
      // Новое: часто покупаемые товары
      setFrequentlyProducts(Array.isArray(freq) ? freq.map(f => f.value || f) : []);
    }).finally(() => setLoadingStats(false));
  }, [client]);

  // Загрузка истории заказов при открытии модального окна
  useEffect(() => {
    if (!historyOpen || !client?.id) return;
    getSaleDocumentsByContrpartner(client.id).then((data) => {
      // Преобразуем структуру заказа для OrderHistoryModal
      const arr = Array.isArray(data)
        ? data.map((o: any) => {
            const doc = o.value?.document || {};
            const assortments = o.value?.assortments || [];
            return {
              date: doc.documentDate ? doc.documentDate.slice(0, 10) : '—',
              sum: doc.sum || null, // если есть сумма
              products: assortments.map((a: any) => ({
                name: a.assortmentName,
                category: a.assortmentCategory,
                standard: a.standard,
                steelGrade: a.steelGrade,
                diameter: a.diameter,
                wall: a.wall,
                qty: a.qty || 1
              })),
              manufacturer: doc.supplier || '—',
              manager: doc.managerName || '—',
              status: doc.status || '—'
            };
          })
        : [];
      setOrders(arr);
    });
  }, [historyOpen, client]);

  // Загрузка рекомендованных труб
  useEffect(() => {
    if (!client?.id) return;
    getAprioriAssortment(client.id).then((data) => {
      setRecommendedProducts(Array.isArray(data) ? data.map(d => d.value || d) : []);
    });
  }, [client]);

  // Загрузка рекомендаций по региону
  useEffect(() => {
    if (!client?.id) return;
    getFrequentlyAssortmentByContrpartner(client.id).then((data) => {
      setRegionalProducts(Array.isArray(data) ? data.map(d => d.value || d) : []);
    });
  }, [client]);

  // Функция для перевода номера месяца в русское название
  function getMonthName(num: number) {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return months[num - 1] || '';
  }

  // Средний чек считаем по заказам клиента
  let avgCheck = null;
  if (client?.orders && client.orders.length > 0) {
    const amounts = client.orders.map((o: any) => parseFloat((o.amount || '').replace(/[^\d\.]/g, ''))).filter(Boolean);
    const total = amounts.reduce((a: number, b: number) => a + b, 0);
    avgCheck = Math.round(total / client.orders.length);
  }
  const scrollBy = (offset: number) => {
    if (topRef.current) {
      topRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };
  if (!client) return null;

  // Заглушки для действий
  const handleRepeatOrder = (order: any) => {
    alert('Повторить заказ: ' + order.date);
  };
  const handleCompareOrder = (order: any) => {
    alert('Сравнить заказ: ' + order.date);
  };

  return (
    <Stack direction="row" spacing={3} alignItems="flex-start">
      <Box flex={1}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', bgcolor: 'transparent', boxSizing: 'border-box', overflowX: 'auto' }}>
          <Paper elevation={6} sx={{ width: '100%', maxWidth: 1200, p: { xs: 2, md: 4 }, mb: 4, bgcolor: '#fff', borderRadius: 6, boxShadow: '0 8px 32px 0 rgba(41,41,41,0.10)', boxSizing: 'border-box', overflow: 'hidden' }}>
            {/* Информация о клиенте */}
            <Box sx={{ mb: 3, p: 3, bgcolor: '#f8f8f8', borderRadius: 4, boxShadow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Stack direction="row" alignItems="center" gap={2}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: '#ffd6b3', color: '#292929', fontWeight: 700, fontSize: 28 }}>
                  {client.contrpartnerName ? client.contrpartnerName[0] : 'К'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, mb: 0.5 }}>{client.contrpartnerName}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => setHistoryOpen(true)}
                    sx={{
                      mt: 1,
                      bgcolor: '#f57838',
                      color: '#fff',
                      fontWeight: 800,
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                      fontSize: 13,
                      minHeight: 32,
                      boxShadow: '0 2px 8px rgba(245,120,56,0.10)',
                      '&:hover': { bgcolor: '#ff8c38' }
                    }}
                  >
                    История заказов
                  </Button>
                </Box>
              </Stack>
              <Typography variant="body2" sx={{ color: '#c8c8c8', fontWeight: 600, mb: 1 }}>{client.contrpartnerType} • {client.levelSale}</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" mb={1}>
                <Chip label={`ИНН: ${client.contrpartnerInn}`} sx={{ bgcolor: '#f57838', color: '#fff', fontWeight: 700 }} />
                <Chip label={`Город: ${client.city || '—'}`} sx={{ bgcolor: '#292929', color: '#fff', fontWeight: 700 }} />
                <Chip label={`Регион: ${client.region || '—'}`} sx={{ bgcolor: '#c8c8c8', color: '#292929', fontWeight: 700 }} />
                <Chip label={`Тип: ${client.contrpartnerType || '—'}`} sx={{ bgcolor: '#ffd6b3', color: '#292929', fontWeight: 700 }} />
                <Chip label={`Категория: ${client.levelSale || '—'}`} sx={{ bgcolor: '#fff', color: '#f57838', fontWeight: 700, border: '1px solid #f57838' }} />
                <Chip label={`Менеджер: ${client.manager || '—'}`} sx={{ bgcolor: '#fff', color: '#292929', fontWeight: 700, border: '1px solid #c8c8c8' }} />
              </Stack>
            </Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <TrendingUpIcon sx={{ color: '#f57838', fontSize: 40 }} />
              <Typography variant="h4" sx={{ color: '#292929', fontWeight: 900, letterSpacing: 1, fontSize: 32 }}>
                Сводная аналитика по клиенту
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }} mb={5}>
              {/* Метрики */}
              <Stack spacing={2} flex={1} minWidth={0}>
                <Card sx={{ p: 3, borderRadius: 4, boxShadow: 3, bgcolor: '#f57838', color: '#fff', minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Объем закупок (год)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontSize: 28 }}>{yearVolume !== null ? `${yearVolume} т` : '—'}</Typography>
                </Card>
                <Card sx={{ p: 3, borderRadius: 4, boxShadow: 3, bgcolor: '#292929', color: '#fff', minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Средний чек</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontSize: 28 }}>{avgCheck !== null ? `${avgCheck} т` : '—'}</Typography>
                </Card>
              </Stack>
              {/* График объемов */}
              <Paper elevation={2} sx={{ flex: 2, p: 3, borderRadius: 4, minWidth: 0, bgcolor: '#f8f8f8', boxSizing: 'border-box', overflow: 'hidden' }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <ShoppingCartIcon sx={{ color: '#f57838' }} />
                  <Typography variant="subtitle1" sx={{ color: '#292929', fontWeight: 700 }}>Объем закупок по месяцам</Typography>
                </Stack>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyVolumes}>
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f57838" radius={[8, 8, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
              {/* Предпочтения по производителям */}
              <Paper elevation={2} sx={{ flex: 1, p: 3, borderRadius: 4, minWidth: 0, bgcolor: '#f8f8f8', boxSizing: 'border-box', overflow: 'hidden' }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <FactoryIcon sx={{ color: '#f57838' }} />
                  <Typography variant="subtitle1" sx={{ color: '#292929', fontWeight: 700 }}>Поставщики</Typography>
                </Stack>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={suppliers} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                      {suppliers.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Stack>
            {/* Часто покупаемые товары */}
            <Divider sx={{ my: 4 }} />
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <LocalOfferIcon sx={{ color: '#f57838', fontSize: 28 }} />
              <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1, flex: 1 }}>
                Часто покупаемые товары
              </Typography>
              <ToggleButtonGroup
                value={topView}
                exclusive
                onChange={(_, val) => val && setTopView(val)}
                size="small"
                sx={{ bgcolor: '#f8f8f8', borderRadius: 2 }}
              >
                <ToggleButton value="table" sx={{ border: 0 }} aria-label="Таблица">
                  <ViewListIcon sx={{ color: topView === 'table' ? '#f57838' : '#c8c8c8' }} />
                </ToggleButton>
                <ToggleButton value="cards" sx={{ border: 0 }} aria-label="Карточки">
                  <ViewModuleIcon sx={{ color: topView === 'cards' ? '#f57838' : '#c8c8c8' }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {topView === 'table' ? (
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 4, mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Категория</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Наименование</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Стандарт</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Марка стали</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Диаметр</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Толщина</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {frequentlyProducts.length > 0 ?
                      frequentlyProducts.map((prod, idx) => {
                        const row = prod && prod.value ? prod.value : prod;
                        return (
                          <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.assortmentCategory}</TableCell>
                            <TableCell>{row.assortmentName}</TableCell>
                            <TableCell>{row.standard}</TableCell>
                            <TableCell>{row.steelGrade}</TableCell>
                            <TableCell>{row.diameter}</TableCell>
                            <TableCell>{row.wall}</TableCell>
                          </TableRow>
                        );
                      })
                      : <TableRow><TableCell colSpan={7}>Нет данных</TableCell></TableRow>
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap mb={2}>
                {frequentlyProducts.length > 0 ? frequentlyProducts.map((row, idx) => (
                  <Paper key={row.id || idx} elevation={4} sx={{ minWidth: 260, maxWidth: 320, flex: '1 1 260px', p: 3, borderRadius: 4, bgcolor: '#fff', boxShadow: '0 4px 16px 0 rgba(41,41,41,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: 2, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 8 } }}>
                    {/* Стандарт */}
                    {row.standard && (
                      <Typography variant="subtitle2" sx={{ color: '#c8c8c8', fontWeight: 700, fontSize: 13, mb: 0.5 }}>{row.standard}</Typography>
                    )}
                    {/* Название */}
                    <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 1 }}>{row.assortmentName}</Typography>
                    {/* Характеристики в чипах */}
                    <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
                      {row.diameter && <Chip label={`⌀ ${row.diameter} мм`} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                      {row.wall && <Chip label={`S: ${row.wall} мм`} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                      {row.steelGrade && <Chip label={row.steelGrade} sx={{ bgcolor: '#ffd6b3', color: '#292929', fontWeight: 700 }} />}
                      {row.factory && <Chip label={row.factory} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                    </Stack>
                    {/* Наличие и мин. партия */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      {row.stock !== undefined && (
                        <><Typography variant="body2" sx={{ color: '#c8c8c8', fontWeight: 700 }}>Наличие:</Typography>
                        <Typography variant="body2" sx={{ color: '#292929', fontWeight: 700 }}>{row.stock}</Typography></>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      {row.minBatch && (
                        <><Typography variant="body2" sx={{ color: '#c8c8c8', fontWeight: 700 }}>Мин. партия:</Typography>
                        <Typography variant="body2" sx={{ color: '#292929', fontWeight: 700 }}>{row.minBatch}</Typography></>
                      )}
                    </Stack>
                    {/* Цена */}
                    {row.price && (
                      <Typography variant="body2" sx={{ color: '#f57838', fontWeight: 900, fontSize: 20, mt: 1 }}>{row.price}</Typography>
                    )}
                  </Paper>
                )) : (
                  <Typography sx={{ color: '#c8c8c8', fontWeight: 700, p: 2 }}>Нет данных</Typography>
                )}
              </Stack>
            )}
            {/* Рекомендованные трубы */}
            <Stack direction="row" alignItems="center" spacing={2} mb={2} mt={4}>
              <StarIcon sx={{ color: '#f57838', fontSize: 28 }} />
              <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1, flex: 1 }}>
                Рекомендации на основе покупок клиента
              </Typography>
              <ToggleButtonGroup
                value={recView}
                exclusive
                onChange={(_, val) => val && setRecView(val)}
                size="small"
                sx={{ bgcolor: '#f8f8f8', borderRadius: 2 }}
              >
                <ToggleButton value="table" sx={{ border: 0 }} aria-label="Таблица">
                  <ViewListIcon sx={{ color: recView === 'table' ? '#f57838' : '#c8c8c8' }} />
                </ToggleButton>
                <ToggleButton value="cards" sx={{ border: 0 }} aria-label="Карточки">
                  <ViewModuleIcon sx={{ color: recView === 'cards' ? '#f57838' : '#c8c8c8' }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {recView === 'table' ? (
              <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 4, mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Наименование</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Категория</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Марка стали</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Диаметр</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Толщина</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Стандарт</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendedProducts.length > 0 ? recommendedProducts.map((row, idx) => (
                      <TableRow key={row.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell sx={{ color: '#292929' }}>{row.assortmentName}</TableCell>
                        <TableCell>{row.assortmentCategory}</TableCell>
                        <TableCell>{row.steelGrade}</TableCell>
                        <TableCell>{row.diameter}</TableCell>
                        <TableCell>{row.wall}</TableCell>
                        <TableCell>{row.standard}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={7}>Нет данных</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap mb={2}>
                {recommendedProducts.length > 0 ? recommendedProducts.map((row, idx) => (
                  <Paper key={row.id || idx} elevation={4} sx={{ minWidth: 260, maxWidth: 320, flex: '1 1 260px', p: 3, borderRadius: 4, bgcolor: '#fff', boxShadow: '0 4px 16px 0 rgba(41,41,41,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: 2, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 8 } }}>
                    {row.standard && (
                      <Typography variant="subtitle2" sx={{ color: '#c8c8c8', fontWeight: 700, fontSize: 13, mb: 0.5 }}>{row.standard}</Typography>
                    )}
                    <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 1 }}>{row.assortmentName}</Typography>
                    <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
                      {row.diameter && <Chip label={`⌀ ${row.diameter} мм`} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                      {row.wall && <Chip label={`S: ${row.wall} мм`} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                      {row.steelGrade && <Chip label={row.steelGrade} sx={{ bgcolor: '#ffd6b3', color: '#292929', fontWeight: 700 }} />}
                      {row.factory && <Chip label={row.factory} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      {row.stock !== undefined && (
                        <><Typography variant="body2" sx={{ color: '#c8c8c8', fontWeight: 700 }}>Наличие:</Typography>
                        <Typography variant="body2" sx={{ color: '#292929', fontWeight: 700 }}>{row.stock}</Typography></>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      {row.minBatch && (
                        <><Typography variant="body2" sx={{ color: '#c8c8c8', fontWeight: 700 }}>Мин. партия:</Typography>
                        <Typography variant="body2" sx={{ color: '#292929', fontWeight: 700 }}>{row.minBatch}</Typography></>
                      )}
                    </Stack>
                    {row.price && (
                      <Typography variant="body2" sx={{ color: '#f57838', fontWeight: 900, fontSize: 20, mt: 1 }}>{row.price}</Typography>
                    )}
                  </Paper>
                )) : (
                  <Typography sx={{ color: '#c8c8c8', fontWeight: 700, p: 2 }}>Нет данных</Typography>
                )}
              </Stack>
            )}
            {/* Рекомендации по региону */}
            <Stack direction="row" alignItems="center" spacing={2} mb={2} mt={4}>
              <StarIcon sx={{ color: '#f57838', fontSize: 28 }} />
              <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800, letterSpacing: 1, flex: 1 }}>
                Рекомендации по региону
              </Typography>
              <ToggleButtonGroup
                value={regionalView}
                exclusive
                onChange={(_, val) => val && setRegionalView(val)}
                size="small"
                sx={{ bgcolor: '#f8f8f8', borderRadius: 2 }}
              >
                <ToggleButton value="table" sx={{ border: 0 }} aria-label="Таблица">
                  <ViewListIcon sx={{ color: regionalView === 'table' ? '#f57838' : '#c8c8c8' }} />
                </ToggleButton>
                <ToggleButton value="cards" sx={{ border: 0 }} aria-label="Карточки">
                  <ViewModuleIcon sx={{ color: regionalView === 'cards' ? '#f57838' : '#c8c8c8' }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {regionalView === 'table' ? (
              <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 4, mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Наименование</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Категория</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Марка стали</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Диаметр</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Толщина</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#292929' }}>Стандарт</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regionalProducts.length > 0 ? regionalProducts.map((row, idx) => (
                      <TableRow key={row.id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell sx={{ color: '#292929' }}>{row.assortmentName}</TableCell>
                        <TableCell>{row.assortmentCategory}</TableCell>
                        <TableCell>{row.steelGrade}</TableCell>
                        <TableCell>{row.diameter}</TableCell>
                        <TableCell>{row.wall}</TableCell>
                        <TableCell>{row.standard}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={7}>Нет данных</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap mb={2}>
                {regionalProducts.length > 0 ? regionalProducts.map((row, idx) => (
                  <Paper key={row.id || idx} elevation={4} sx={{ minWidth: 260, maxWidth: 320, flex: '1 1 260px', p: 3, borderRadius: 4, bgcolor: '#fff', boxShadow: '0 4px 16px 0 rgba(41,41,41,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, mb: 2, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 8 } }}>
                    {row.standard && (
                      <Typography variant="subtitle2" sx={{ color: '#c8c8c8', fontWeight: 700, fontSize: 13, mb: 0.5 }}>{row.standard}</Typography>
                    )}
                    <Typography variant="h6" sx={{ color: '#292929', fontWeight: 800, mb: 1 }}>{row.assortmentName}</Typography>
                    <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
                      {row.diameter && <Chip label={`⌀ ${row.diameter} мм`} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                      {row.wall && <Chip label={`S: ${row.wall} мм`} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                      {row.steelGrade && <Chip label={row.steelGrade} sx={{ bgcolor: '#ffd6b3', color: '#292929', fontWeight: 700 }} />}
                      {row.factory && <Chip label={row.factory} sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700 }} />}
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      {row.stock !== undefined && (
                        <><Typography variant="body2" sx={{ color: '#c8c8c8', fontWeight: 700 }}>Наличие:</Typography>
                        <Typography variant="body2" sx={{ color: '#292929', fontWeight: 700 }}>{row.stock}</Typography></>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      {row.minBatch && (
                        <><Typography variant="body2" sx={{ color: '#c8c8c8', fontWeight: 700 }}>Мин. партия:</Typography>
                        <Typography variant="body2" sx={{ color: '#292929', fontWeight: 700 }}>{row.minBatch}</Typography></>
                      )}
                    </Stack>
                    {row.price && (
                      <Typography variant="body2" sx={{ color: '#f57838', fontWeight: 900, fontSize: 20, mt: 1 }}>{row.price}</Typography>
                    )}
                  </Paper>
                )) : (
                  <Typography sx={{ color: '#c8c8c8', fontWeight: 700, p: 2 }}>Нет данных</Typography>
                )}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>
      <OrderHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRepeat={handleRepeatOrder}
        onCompare={handleCompareOrder}
        orders={orders}
      />
    </Stack>
  );
};

export default MainAnalytics; 