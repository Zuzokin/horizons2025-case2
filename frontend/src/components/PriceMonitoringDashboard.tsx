import React, { useState } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import ProductFilters from './ProductFilters';
import ProblematicTubesTable from './ProblematicTubesTable';
import TubeDetailModal from './TubeDetailModal';
import UserMenu from './UserMenu';
import DashboardIcon from '@mui/icons-material/Dashboard';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

function PriceMonitoringDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    productType: 'Все виды',
    warehouse: 'Все склады',
    name: '',
    steelGrade: 'Все марки',
    diameter: 'Все диаметры',
    gost: 'Все ГОСТы'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTube, setSelectedTube] = useState<any>(null);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleTubeSelect = (tube: any) => {
    setSelectedTube(tube);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTube(null);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', bgcolor: 'transparent', boxSizing: 'border-box', overflowX: 'auto' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 1600, p: { xs: 2, md: 4 }, mb: 4, bgcolor: '#fff', borderRadius: 6, boxShadow: '0 8px 32px 0 rgba(41,41,41,0.10)', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <DashboardIcon sx={{ color: '#f57838', fontSize: 40 }} />
            <Typography variant="h4" sx={{ color: '#292929', fontWeight: 900, letterSpacing: 1, fontSize: 32 }}>
              Дашборд мониторинга цен на металлопродукцию
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <UserMenu />
          </Stack>
        </Stack>

        {/* Фильтры и таблица мониторинга труб */}
        <ProductFilters onFiltersChange={handleFiltersChange} />
        <ProblematicTubesTable onTubeSelect={handleTubeSelect} filters={filters} />

      </Paper>

      {/* Модальное окно для детального анализа трубы */}
      <TubeDetailModal
        open={modalOpen}
        onClose={handleModalClose}
        tubeData={selectedTube}
      />
    </Box>
  );
}

export default PriceMonitoringDashboard;