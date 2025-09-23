import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PriceMonitoringDashboard from './components/PriceMonitoringDashboard';
import AuthPage from './components/AuthPage';
import WelcomeScreen from './components/WelcomeScreen';
import { Box, CircularProgress } from '@mui/material';

function AppContent() {
  const { isAuthenticated, isLoading, showWelcome } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress sx={{ color: '#f57838' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <Box
        sx={{
          flex: 1,
          maxWidth: 1600,
          mx: 'auto',
          px: { xs: 1, md: 4 },
          py: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <PriceMonitoringDashboard />
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;


