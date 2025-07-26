import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Paper,
  Divider,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Dashboard,
  School,
  Settings,
  KeyboardArrowDown,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { eventState } from '../../../../shared/context/eventProvider';
import TemporaryDrawer from './drawer';

const NavbarHod = ({ activePage, setActivePage, onRefresh }) => {
  const theme = useTheme();
  const { user } = eventState();
  const [open, setOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const getPageTitle = (page) => {
    const titles = {
      overview: 'Dashboard Overview',
      proposal: 'Event History',
      approved: 'Approved Events',
      pendingProposal: 'Pending Proposals',
      finance: 'Finance Management',
      finalBudget: 'Final Budget Review',
      convenorCommittee: 'Event Organizers',
      signatureManagement: 'Digital Signatures',
      profile: 'Profile Settings',
      calendar: 'Event Calendar',
      notifications: 'Notification Center'
    };
    return titles[page] || 'HOD Dashboard';
  };

  const getPageIcon = (page) => {
    const icons = {
      overview: '📊',
      proposal: '📋',
      approved: '✅',
      pendingProposal: '⏳',
      finance: '💰',
      finalBudget: '📊',
      convenorCommittee: '👥',
      signatureManagement: '✍️',
      profile: '👤',
      calendar: '📅',
      notifications: '🔔'
    };
    return icons[page] || '🏠';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.main} 0%, 
          ${theme.palette.primary.dark} 50%, 
          ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
        borderRadius: 4,
        padding: 3,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        color: 'white',
        mb: 3,
        border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
        backdropFilter: 'blur(20px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 50%)
          `,
          borderRadius: 4,
        }
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Menu Button */}
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{
            color: 'white',
            background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.15)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            width: 48,
            height: 48,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.25)} 0%, ${alpha(theme.palette.common.white, 0.15)} 100%)`,
              transform: 'scale(1.05) rotate(90deg)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <MenuIcon sx={{ fontSize: 24 }} />
        </IconButton>

        {/* Enhanced Title Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)} 0%, ${alpha(theme.palette.common.white, 0.1)} 100%)`,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <School sx={{ fontSize: 32, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontSize: '1.5rem' }}>
                {getPageIcon(activePage)}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  background: `linear-gradient(45deg, ${theme.palette.common.white} 0%, ${alpha(theme.palette.common.white, 0.8)} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {getPageTitle(activePage)}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: '0.9rem',
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              🎓 Head of Department Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          

          {/* Enhanced Refresh Button */}
          {(activePage === 'finance' || activePage === 'finalBudget') && onRefresh && (
            <Tooltip title="Refresh Data" arrow>
              <IconButton
                onClick={onRefresh}
                sx={{
                  color: 'white',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.3)} 0%, ${alpha(theme.palette.success.dark, 0.2)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.success.light, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.4)} 0%, ${alpha(theme.palette.success.dark, 0.3)} 100%)`,
                    transform: 'scale(1.1) rotate(180deg)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Enhanced Notifications */}
          <Tooltip title="Notifications" arrow>
            <IconButton
              onClick={() => setActivePage('notifications')}
              sx={{
                color: 'white',
                background: activePage === 'notifications' 
                  ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.4)} 0%, ${alpha(theme.palette.warning.dark, 0.3)} 100%)`
                  : `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.1)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.3)} 0%, ${alpha(theme.palette.warning.dark, 0.2)} 100%)`,
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              
                <NotificationsIcon />
              
            </IconButton>
          </Tooltip>
        </Box>

        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{ 
            borderColor: alpha(theme.palette.common.white, 0.3),
            mx: 1,
            height: 40
          }} 
        />

        {/* Enhanced User Profile */}
        {user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 3,
              py: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.15)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
              backdropFilter: 'blur(15px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.25)} 0%, ${alpha(theme.palette.common.white, 0.15)} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setActivePage('profile')}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.3)} 0%, ${alpha(theme.palette.common.white, 0.1)} 100%)`,
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
                border: `2px solid ${alpha(theme.palette.common.white, 0.4)}`,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || 'H'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                lineHeight: 1.2, 
                mb: 0.5,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                Dr. {user.name || 'HOD'}
              </Typography>
              <Typography variant="caption" sx={{ 
                opacity: 0.9, 
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
                {user.department || 'Department Head'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip
                label="HOD"
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
              <KeyboardArrowDown 
                sx={{ 
                  fontSize: 16, 
                  opacity: 0.7,
                  alignSelf: 'center'
                }} 
              />
            </Box>
          </Box>
        )}
      </Box>

      <TemporaryDrawer
        open={open}
        onClose={toggleDrawer(false)}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Add CSS animation for badge pulse */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </Paper>
  );
};

export default NavbarHod;