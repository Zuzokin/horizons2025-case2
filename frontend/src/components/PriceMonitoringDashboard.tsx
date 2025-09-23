import React, { useState } from 'react';
import { Box, Typography, Paper, Stack, Tab, Tabs } from '@mui/material';
import PriceAnalytics from './PriceAnalytics';
import CompetitorMonitoring from './CompetitorMonitoring';
import PriceRecommendations from './PriceRecommendations';
import MarketOverview from './MarketOverview';
import ProductFilters from './ProductFilters';
import ProblematicTubesTable from './ProblematicTubesTable';
import TubeDetailModal from './TubeDetailModal';
import CompetitorNotifications from './CompetitorNotifications';
import ApiConfigPanel from './ApiConfigPanel';
import ServerConfigPanel from './ServerConfigPanel';
import UserMenu from './UserMenu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SettingsIcon from '@mui/icons-material/Settings';
import ComputerIcon from '@mui/icons-material/Computer';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

function PriceMonitoringDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
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


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

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
          <UserMenu />
        </Stack>

        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Мониторинг труб" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="Обзор рынка" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="Аналитика цен" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="Мониторинг конкурентов" icon={<CompareArrowsIcon />} iconPosition="start" />
          <Tab label="Рекомендации по ценам" icon={<LightbulbIcon />} iconPosition="start" />
          <Tab label="Настройки сервера" icon={<ComputerIcon />} iconPosition="start" />
          <Tab label="Настройки API" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>

        {currentTab === 0 && (
          <>
            <CompetitorNotifications />
            <ProductFilters onFiltersChange={handleFiltersChange} />
            <ProblematicTubesTable onTubeSelect={handleTubeSelect} filters={filters} />
          </>
        )}
        {currentTab !== 0 && currentTab !== 5 && currentTab !== 6 && <ProductFilters onFiltersChange={handleFiltersChange} />}
        
        {currentTab === 1 && <MarketOverview filters={filters} />}
        {currentTab === 2 && <PriceAnalytics filters={filters} />}
        {currentTab === 3 && <CompetitorMonitoring filters={filters} />}
        {currentTab === 4 && <PriceRecommendations filters={filters} />}
        {currentTab === 5 && <ServerConfigPanel />}
        {currentTab === 6 && <ApiConfigPanel />}

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