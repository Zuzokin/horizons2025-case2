import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Typography, TextField, Chip
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const statusColor = (status: string) => {
  if (status === 'Выполнен') return 'success';
  if (status === 'В обработке') return 'warning';
  if (status === 'Отменён') return 'default';
  return 'default';
};

interface OrderHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onRepeat: (order: any) => void;
  onCompare: (order: any) => void;
  orders?: any[];
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ open, onClose, onRepeat, onCompare, orders = [] }) => {
  const [period, setPeriod] = useState('');
  // Состояние для раскрытия товаров по заказу
  const [showAllProducts, setShowAllProducts] = useState<{ [key: number]: boolean }>({});

  // Фильтрация по периоду (очень простая, для примера)
  const filteredOrders = period
    ? orders.filter(o => o.date && o.date.startsWith(period))
    : orders;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(41,41,41,0.15)', minWidth: 900 } }}>
      <DialogTitle sx={{ fontWeight: 900, fontSize: 28, color: '#292929', pb: 1, pt: 3, px: 4 }}>
        История заказов
      </DialogTitle>
      <DialogContent sx={{ px: 4, pt: 1, pb: 0 }}>
        <Stack direction="row" spacing={2} mb={3} alignItems="center">
          <Typography sx={{ fontWeight: 700, color: '#292929' }}>Период:</Typography>
          <TextField
            type="month"
            size="small"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            sx={{ minWidth: 160, bgcolor: '#f8f8f8', borderRadius: 2 }}
            inputProps={{ style: { fontWeight: 700, color: '#292929' } }}
          />
        </Stack>
        <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                <TableCell sx={{ fontWeight: 700, color: '#292929', fontSize: 16 }}>Дата заказа</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#292929', fontSize: 16 }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#292929', fontSize: 16 }}>Товары</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#292929', fontSize: 16 }}>Производитель</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#292929', fontSize: 16 }}>Менеджер</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#292929', fontSize: 16 }}>Статус</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#292929', fontSize: 16 }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => {
                const showAll = showAllProducts[idx] || false;
                const visibleProducts = showAll ? order.products : order.products.slice(0, 2);
                return (
                  <TableRow key={idx} sx={{ height: 64 }}>
                    <TableCell sx={{ fontWeight: 600, color: '#292929', fontSize: 15 }}>{order.date}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#f57838', fontSize: 16 }}>{order.sum ? order.sum.toLocaleString() : '—'} ₽</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#292929', fontSize: 15, whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: 260 }}>
                      <Stack spacing={0.5} alignItems="flex-start">
                        {visibleProducts && visibleProducts.length > 0 ? visibleProducts.map((prod: any, i: number) => (
                          <div key={i} style={{ marginBottom: 8 }}>
                            <strong>{prod.category}</strong><br/>
                            {prod.name}<br/>
                            <span style={{ color: '#c8c8c8' }}>
                              {prod.standard} | {prod.steelGrade} | ⌀{prod.diameter} | S: {prod.wall}
                            </span>
                          </div>
                        )) : '—'}
                        {order.products.length > 2 && !showAll && (
                          <button
                            style={{ color: '#f57838', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                            onClick={() => setShowAllProducts(prev => ({ ...prev, [idx]: true }))}
                          >
                            + ещё {order.products.length - 2}
                          </button>
                        )}
                        {showAll && order.products.length > 2 && (
                          <button
                            style={{ color: '#c8c8c8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                            onClick={() => setShowAllProducts(prev => ({ ...prev, [idx]: false }))}
                          >
                            Свернуть
                          </button>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#292929', fontSize: 15 }}>{order.manufacturer || order.supplier || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#292929', fontSize: 15 }}>{order.manager || '—'}</TableCell>
                    <TableCell>
                      <Chip label={order.status || '—'} color={statusColor(order.status)} sx={{ fontWeight: 700, fontSize: 14, px: 1.5, borderRadius: 2 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Chip
                          icon={<ReplayIcon sx={{ color: '#f57838' }} />}
                          label="Повторить"
                          onClick={() => onRepeat(order)}
                          sx={{ bgcolor: '#fff7f0', color: '#f57838', fontWeight: 700, cursor: 'pointer', borderRadius: 2, px: 1.5, '&:hover': { bgcolor: '#ffe3cc' } }}
                          clickable
                        />
                        <Chip
                          icon={<CompareArrowsIcon sx={{ color: '#292929' }} />}
                          label="Сравнить"
                          onClick={() => onCompare(order)}
                          sx={{ bgcolor: '#f8f8f8', color: '#292929', fontWeight: 700, cursor: 'pointer', borderRadius: 2, px: 1.5, '&:hover': { bgcolor: '#e0e0e0' } }}
                          clickable
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: '#c8c8c8', fontWeight: 700 }}>
                    Нет заказов
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3, pt: 2 }}>
        <Button onClick={onClose} color="primary" sx={{ fontWeight: 700, fontSize: 16 }}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderHistoryModal; 