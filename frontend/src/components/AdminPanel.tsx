import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AdminPanelSettings,
  PersonAdd,
  Add,
  Refresh,
  Security,
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllUsers, 
  adminRegisterUser, 
  createAdminUser,
  AdminUserResponse,
  AdminRegisterRequest,
  CreateAdminRequest
} from '../api';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

function AdminPanel({ open, onClose }: AdminPanelProps) {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Диалоги
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  
  // Формы
  const [registerForm, setRegisterForm] = useState<AdminRegisterRequest>({
    email: '',
    first_name: '',
    last_name: '',
    password: ''
  });
  
  const [adminForm, setAdminForm] = useState<CreateAdminRequest>({
    email: '',
    password: '',
    first_name: 'Admin',
    last_name: 'User'
  });

  const loadUsers = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const usersData = await getAllUsers(token);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, token]);

  const handleRegisterUser = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await adminRegisterUser(registerForm, token);
      setSuccess('Пользователь успешно зарегистрирован');
      setRegisterDialogOpen(false);
      setRegisterForm({ email: '', first_name: '', last_name: '', password: '' });
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await createAdminUser(adminForm, token);
      setSuccess('Администратор успешно создан');
      setAdminDialogOpen(false);
      setAdminForm({ email: '', password: '', first_name: 'Admin', last_name: 'User' });
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания администратора');
    } finally {
      setIsLoading(false);
    }
  };

  // Проверяем, является ли пользователь админом
  if (!user?.is_admin) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Security sx={{ color: '#f57838', fontSize: 32 }} />
              <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800 }}>
                Доступ запрещен
              </Typography>
            </Stack>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#616161' }}>
              У вас нет прав администратора для доступа к этой панели
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <AdminPanelSettings sx={{ color: '#f57838', fontSize: 32 }} />
            <Typography variant="h5" sx={{ color: '#292929', fontWeight: 800 }}>
              Панель администратора
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setRegisterDialogOpen(true)}
            sx={{
              bgcolor: '#f57838',
              '&:hover': { bgcolor: '#ff8c38' },
              fontWeight: 700
            }}
          >
            Зарегистрировать пользователя
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Security />}
            onClick={() => setAdminDialogOpen(true)}
            sx={{
              borderColor: '#f57838',
              color: '#f57838',
              '&:hover': { 
                borderColor: '#ff8c38',
                bgcolor: 'rgba(245, 120, 56, 0.04)'
              },
              fontWeight: 700
            }}
          >
            Создать администратора
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUsers}
            disabled={isLoading}
            sx={{
              borderColor: '#616161',
              color: '#616161',
              '&:hover': { 
                borderColor: '#292929',
                bgcolor: 'rgba(97, 97, 97, 0.04)'
              },
              fontWeight: 700
            }}
          >
            Обновить
          </Button>
        </Stack>

        <Typography variant="h6" sx={{ color: '#292929', fontWeight: 700, mb: 2 }}>
          Список пользователей ({users.length})
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#f57838' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Имя</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Фамилия</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Роль</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_admin ? 'Администратор' : 'Пользователь'}
                        color={user.is_admin ? 'error' : 'default'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          ...(user.is_admin ? {
                            bgcolor: '#ffebee',
                            color: '#d32f2f'
                          } : {
                            bgcolor: '#f5f5f5',
                            color: '#616161'
                          })
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        </Box>
      </DialogContent>

      {/* Диалог регистрации пользователя */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Регистрация нового пользователя
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Имя"
                value={registerForm.first_name}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label="Фамилия"
                value={registerForm.last_name}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </Stack>
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
              required
              helperText="Минимум 6 символов"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleRegisterUser}
            variant="contained"
            disabled={isLoading}
            sx={{
              bgcolor: '#f57838',
              '&:hover': { bgcolor: '#ff8c38' },
              fontWeight: 700
            }}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрировать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания администратора */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Создание нового администратора
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Имя"
                value={adminForm.first_name}
                onChange={(e) => setAdminForm(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
              <TextField
                fullWidth
                label="Фамилия"
                value={adminForm.last_name}
                onChange={(e) => setAdminForm(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </Stack>
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
              required
              helperText="Минимум 6 символов"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleCreateAdmin}
            variant="contained"
            disabled={isLoading}
            sx={{
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' },
              fontWeight: 700
            }}
          >
            {isLoading ? 'Создание...' : 'Создать администратора'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default AdminPanel;
