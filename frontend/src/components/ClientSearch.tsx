import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Button
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import catalogImg from '../assets/catalog.png';
import { getContrpartnerByInn, getContrpartnerByName } from '../api';

const ClientSearch = ({ onSelectClient }: { onSelectClient?: (client: any) => void }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    setSearch(value);
    setLoading(true);
    try {
      let data = [];
      if (/^\d{6,}$/.test(value)) {
        // Поиск по ИНН
        const res = await getContrpartnerByInn(value);
        data = Array.isArray(res) ? res : [res];
      } else if (value.length > 2) {
        // Поиск по названию
        const res = await getContrpartnerByName(value);
        data = Array.isArray(res) ? res : [res];
      }
      setClients(data);
      if (data.length > 0 && onSelectClient) {
        setSelectedClient(data[0]);
        onSelectClient(data[0]);
      }
    } catch (e) {
      setClients([]);
    }
    setLoading(false);
  };

  const filteredClients = clients.filter(c =>
    (category === 'Все' || c.category === category)
  );

  const handleSelect = (client: any | null) => {
    setSelectedClient(client);
    if (onSelectClient) onSelectClient(client);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', bgcolor: 'transparent', boxSizing: 'border-box', overflowX: 'auto' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 1200, p: { xs: 2, md: 5 }, mb: 5, bgcolor: '#fff', borderRadius: 6, boxShadow: '0 8px 32px 0 rgba(41,41,41,0.10)', boxSizing: 'border-box', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <SearchIcon sx={{ color: '#f57838', fontSize: 36 }} />
          <Typography variant="h4" sx={{ color: '#292929', fontWeight: 900, letterSpacing: 1, fontSize: 32 }}>
            Быстрый поиск клиента
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={4}>
          <Autocomplete
            freeSolo
            options={[]}
            sx={{ flex: 2, minWidth: 220 }}
            inputValue={search}
            onInputChange={(_, value) => handleSearch(value)}
            onChange={(_, value) => handleSearch(value || '')}
            renderInput={(params) => <TextField {...params} label="Поиск по ИНН или названию" variant="outlined" size="medium" InputProps={{ ...params.InputProps, startAdornment: <BusinessIcon sx={{ color: '#f57838', mr: 1 }} /> }} />}
          />
        </Stack>
        {loading && <Typography sx={{ color: '#f57838', mb: 2 }}>Загрузка...</Typography>}
        {/* Больше не показываем список клиентов */}
      </Paper>
    </Box>
  );
};

export default ClientSearch; 