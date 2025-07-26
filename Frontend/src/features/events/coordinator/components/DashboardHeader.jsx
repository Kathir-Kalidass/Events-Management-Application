import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Add,
  Dashboard,
  ExitToApp,
  Person,
  School,
  AccountCircle,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  EventNote,
  Assessment,
  MoreVert
} from '@mui/icons-material';
import { eventState } from '../../../../shared/context/eventProvider';
import ProfileDialog from './ProfileDialog';

const DashboardHeader = ({ onLogout, onCreateNew }) => {
  const theme = useTheme();
  const { user } = eventState();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const quickActions = [
    { label: 'View Events', icon: <EventNote />, action: () => console.log('View Events') },
    { label: 'Analytics', icon: <Assessment />, action: () => console.log('Analytics') },
    { label: 'Settings', icon: <SettingsIcon />, action: () => setProfileOpen(true) }
  ];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
              }}
            >
              <Dashboard sx={{ fontSize: 36, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
            </Box>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  mb: 1,
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  background: `linear-gradient(45deg, ${theme.palette.common.white} 0%, ${alpha(theme.palette.common.white, 0.8)} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Coordinator Hub
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: '1.1rem'
                }}
              >
                Streamline events, manage participants, and drive success
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Chip
                  label="Event Management"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.8),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
                <Chip
                  label="Administrative Portal"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.info.main, 0.8),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* Quick Actions */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Tooltip title="Notifications" arrow>
                <IconButton
                  sx={{
                    color: 'white',
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>

            {/* User Profile Section */}
            {user && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                onClick={() => setProfileOpen(true)}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'C'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                    {user.name || 'Coordinator'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                    {user.designation || 'Event Coordinator'}
                  </Typography>
                  <Chip
                    label="COORDINATOR"
                    size="small"
                    sx={{
                      mt: 0.5,
                      backgroundColor: alpha(theme.palette.warning.main, 0.8),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1)
                    }
                  }}
                >
                  <AccountCircle />
                </IconButton>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreateNew}
                sx={{
                  backgroundColor: alpha(theme.palette.common.white, 0.95),
                  color: theme.palette.primary.main,
                  borderRadius: 3,
                  px: 4,
                  py: 2,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  '&:hover': {
                    backgroundColor: theme.palette.common.white,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Create Event
              </Button>

              {/* More Actions Menu */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  color: 'white',
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <MoreVert />
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }
                }}
              >
                {quickActions.map((action, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      action.action();
                      handleMenuClose();
                    }}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <Box sx={{ mr: 2, color: theme.palette.primary.main }}>
                      {action.icon}
                    </Box>
                    {action.label}
                  </MenuItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <MenuItem
                  onClick={() => {
                    onLogout();
                    handleMenuClose();
                  }}
                  sx={{
                    py: 1.5,
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.08)
                    }
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    <ExitToApp />
                  </Box>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Dialog */}
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
};

export default DashboardHeader;