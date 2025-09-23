import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  ListItemIcon,
  Badge
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../contexts/AuthContext';
import CompetitorNotificationsModal from './CompetitorNotificationsModal';
import AdminPanel from './AdminPanel';

function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const { user, logout } = useAuth();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleNotificationsOpen = () => {
    setNotificationsOpen(true);
    handleClose(); // Закрываем меню пользователя
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
  };

  const handleAdminPanelOpen = () => {
    setAdminPanelOpen(true);
    handleClose(); // Закрываем меню пользователя
  };

  const handleAdminPanelClose = () => {
    setAdminPanelOpen(false);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Пользователь';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {/* Кнопка уведомлений */}
      <IconButton
        onClick={handleNotificationsOpen}
        size="small"
        sx={{
          mr: 1,
          '&:hover': {
            bgcolor: 'rgba(245, 120, 56, 0.08)'
          }
        }}
        aria-label="Уведомления конкурентов"
      >
        <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
          <NotificationsIcon sx={{ color: '#f57838', fontSize: 24 }} />
        </Badge>
      </IconButton>

      {/* Аватар пользователя */}
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          '&:hover': {
            bgcolor: 'rgba(245, 120, 56, 0.08)'
          }
        }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          sx={{
            bgcolor: '#f57838',
            color: '#fff',
            width: 32,
            height: 32,
            fontSize: '0.875rem',
            fontWeight: 700
          }}
        >
          {getUserInitials()}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#292929' }}>
              {getUserDisplayName()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#616161' }}>
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        {user?.is_admin && (
          <MenuItem onClick={handleAdminPanelOpen}>
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">Панель администратора</Typography>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Выйти</Typography>
        </MenuItem>
      </Menu>

      {/* Модальное окно уведомлений */}
      <CompetitorNotificationsModal
        open={notificationsOpen}
        onClose={handleNotificationsClose}
      />

      {/* Модальное окно админ панели */}
      <AdminPanel
        open={adminPanelOpen}
        onClose={handleAdminPanelClose}
      />
    </Box>
  );
}

export default UserMenu;
