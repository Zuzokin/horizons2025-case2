import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

interface DataStatusIndicatorProps {
  isMockData?: boolean;
  lastUpdate?: string;
  recordCount?: number;
}

function DataStatusIndicator({ isMockData, lastUpdate, recordCount }: DataStatusIndicatorProps) {
  if (isMockData) {
    return (
      <Tooltip title="Используются демонстрационные данные. Реальный API недоступен.">
        <Chip
          icon={<WarningIcon />}
          label="Демо данные"
          color="warning"
          variant="outlined"
          size="small"
        />
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="Данные получены из реального API">
        <Chip
          icon={<CheckCircleIcon />}
          label="Реальные данные"
          color="success"
          variant="outlined"
          size="small"
        />
      </Tooltip>
      
      {lastUpdate && (
        <Tooltip title={`Последнее обновление: ${new Date(lastUpdate).toLocaleString('ru-RU')}`}>
          <Chip
            icon={<InfoIcon />}
            label={new Date(lastUpdate).toLocaleTimeString('ru-RU')}
            color="info"
            variant="outlined"
            size="small"
          />
        </Tooltip>
      )}
      
      {recordCount && (
        <Typography variant="caption" color="text.secondary">
          {recordCount} записей
        </Typography>
      )}
    </Box>
  );
}

export default DataStatusIndicator;
