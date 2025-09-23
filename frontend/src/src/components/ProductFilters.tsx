import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import { fetchRealMetalsPricingData, getUniqueValues } from '../data/realMetalsPricingData';

interface FilterState {
  productType: string;
  warehouse: string;
  name: string;
  steelGrade: string;
  diameter: string;
  gost: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

// Получаем уникальные значения из реальных данных
let productTypes = ['Все виды'];
let warehouses = ['Все склады'];
let steelGrades = ['Все марки'];
let diameters = ['Все диаметры'];
let gosts = ['Все ГОСТы'];

// Загружаем данные для фильтров
fetchRealMetalsPricingData(1000, 0).then(data => {
  productTypes = ['Все виды', ...getUniqueValues(data.records, 'вид_продукции')];
  warehouses = ['Все склады', ...getUniqueValues(data.records, 'склад')];
  steelGrades = ['Все марки', ...getUniqueValues(data.records, 'марка_стали')];
  diameters = ['Все диаметры', ...getUniqueValues(data.records, 'диаметр')];
  gosts = ['Все ГОСТы', ...getUniqueValues(data.records, 'ГОСТ')];
}).catch(error => {
  console.error('Error loading filter data:', error);
});

function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    productType: 'Все виды',
    warehouse: 'Все склады',
    name: '',
    steelGrade: 'Все марки',
    diameter: 'Все диаметры',
    gost: 'Все ГОСТы'
  });

  const [expanded, setExpanded] = useState(true);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      productType: 'Все виды',
      warehouse: 'Все склады',
      name: '',
      steelGrade: 'Все марки',
      diameter: 'Все диаметры',
      gost: 'Все ГОСТы'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.productType !== 'Все виды') count++;
    if (filters.warehouse !== 'Все склады') count++;
    if (filters.name) count++;
    if (filters.steelGrade !== 'Все марки') count++;
    if (filters.diameter !== 'Все диаметры') count++;
    if (filters.gost !== 'Все ГОСТы') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper elevation={3} sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2,
          bgcolor: '#f8f8f8',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#f0f0f0' }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <FilterListIcon sx={{ color: '#f57838', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#292929', fontWeight: 700 }}>
            Фильтры продукции
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              sx={{
                bgcolor: '#f57838',
                color: '#fff',
                fontWeight: 700,
                minWidth: 24,
                height: 24
              }}
            />
          )}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          {activeFiltersCount > 0 && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              sx={{
                color: '#f57838',
                fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(245, 120, 56, 0.1)' }
              }}
            >
              Очистить
            </Button>
          )}
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel sx={{ color: '#292929', fontWeight: 600, fontSize: '0.875rem' }}>Вид продукции</InputLabel>
              <Select
                value={filters.productType}
                label="Вид продукции"
                size="small"
                onChange={(e) => handleFilterChange('productType', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
                }}
              >
                {productTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: '#292929', fontWeight: 600, fontSize: '0.875rem' }}>Склад</InputLabel>
              <Select
                value={filters.warehouse}
                label="Склад"
                size="small"
                onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
                }}
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse} value={warehouse}>
                    {warehouse}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
              }}
              label="Наименование"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Поиск по названию..."
              size="small"
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: '#292929', fontWeight: 600, fontSize: '0.875rem' }}>Марка стали</InputLabel>
              <Select
                value={filters.steelGrade}
                label="Марка стали"
                size="small"
                onChange={(e) => handleFilterChange('steelGrade', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
                }}
              >
                {steelGrades.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: '#292929', fontWeight: 600, fontSize: '0.875rem' }}>Диаметр</InputLabel>
              <Select
                value={filters.diameter}
                label="Диаметр"
                size="small"
                onChange={(e) => handleFilterChange('diameter', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
                }}
              >
                {diameters.map((diameter) => (
                  <MenuItem key={diameter} value={diameter}>
                    {diameter}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: '#292929', fontWeight: 600, fontSize: '0.875rem' }}>ГОСТ</InputLabel>
              <Select
                value={filters.gost}
                label="ГОСТ"
                size="small"
                onChange={(e) => handleFilterChange('gost', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c8c8c8' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f57838' }
                }}
              >
                {gosts.map((gost) => (
                  <MenuItem key={gost} value={gost}>
                    {gost}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

export default ProductFilters;