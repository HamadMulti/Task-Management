import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  useMediaQuery,
  useTheme as useMUITheme,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const muiTheme = useMUITheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/');
  };

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Posts', path: '/posts' },
    { label: 'Categories', path: '/categories' },
  ];

  const renderUserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
        Profile
      </MenuItem>
      <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
        Dashboard
      </MenuItem>
      <MenuItem onClick={() => { navigate('/create-post'); handleMenuClose(); }}>
        Create Post
      </MenuItem>
      {user?.role === 'admin' && (
        <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
          Admin Panel
        </MenuItem>
      )}
      <Divider />
      <MenuItem disabled>
        <Typography variant="caption" color="textSecondary">
          Role: {user?.role_display || user?.role}
        </Typography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const renderMobileMenu = () => {
    const menuItems = [];
    
    if (isAuthenticated) {
      navigationItems.forEach((item) => {
        menuItems.push(
          <MenuItem key={item.path} onClick={() => { navigate(item.path); handleMenuClose(); }}>
            {item.label}
          </MenuItem>
        );
      });
    } else {
      menuItems.push(
        <MenuItem key="home" onClick={() => { navigate('/'); handleMenuClose(); }}>
          Home
        </MenuItem>,
        <MenuItem key="login" onClick={() => { navigate('/login'); handleMenuClose(); }}>
          Login
        </MenuItem>,
        <MenuItem key="register" onClick={() => { navigate('/register'); handleMenuClose(); }}>
          Register
        </MenuItem>
      );
    }
    
    return (
      <Menu
        anchorEl={mobileMenuAnchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMenuClose}
      >
        {menuItems}
      </Menu>
    );
  };

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          TaskMaster
        </Typography>

        {!isMobile && isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user?.is_verified && (
                <Chip
                  label="Verified"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user?.avatar ? (
                  <Avatar src={user.avatar} alt={user.full_name} sx={{ width: 32, height: 32 }} />
                ) : (
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.first_name?.[0]}
                  </Avatar>
                )}
              </IconButton>
              {renderUserMenu()}
            </Box>
          ) : (
            !isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  startIcon={<Login />}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  startIcon={<PersonAdd />}
                >
                  Register
                </Button>
              </Box>
            )
          )}

          {isMobile && (
            <IconButton
              edge="end"
              aria-label="menu"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {renderMobileMenu()}
      </Toolbar>
    </AppBar>
  );
};