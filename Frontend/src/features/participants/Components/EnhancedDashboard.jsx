import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Drawer,
  ListItem,
  List,
  ListItemText,
  Box,
  CssBaseline,
  IconButton,
  ListItemIcon,
  ThemeProvider,
  createTheme,
  Fade,
  Badge,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Paper,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as EmojiEventsIcon,
  Feedback as FeedbackIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';

// Import enhanced components
import EnhancedEventsList from './EnhancedEventsList';
import EnhancedMyEvents from './EnhancedMyEvents';
import EnhancedFeedbackPortal from './EnhancedFeedbackPortal';
import EnhancedCertificates from './EnhancedCertificates';
import EnhancedProfile from './EnhancedProfile';
import EnhancedDashboardHome from './EnhancedDashboardHome';
import EnhancedNotifications from './EnhancedNotifications';

const drawerWidth = 280;

const EnhancedParticipantDashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [fadeIn, setFadeIn] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState({
    totalEvents: 0,
    attendedEvents: 0,
    certificates: 0,
    pendingFeedback: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user info
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
  const userName = userInfo.name || 'Participant';
  const userEmail = userInfo.email || '';
  const participantId = userInfo._id;

  // Create dynamic theme
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#1976d2',
      },
      secondary: {
        main: darkMode ? '#f48fb1' : '#dc004e',
      },
      background: {
        default: darkMode ? '#0a0a0a' : '#f5f5f5',
        paper: darkMode ? '#1a1a1a' : '#ffffff',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            background: darkMode 
              ? 'rgba(26, 26, 26, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(20px)',
            background: darkMode 
              ? 'rgba(26, 26, 26, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px)',
            background: darkMode 
              ? 'rgba(26, 26, 26, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
  });

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: <DashboardIcon />, 
      view: 'dashboard',
      description: 'Overview and statistics'
    },
    { 
      label: 'Browse Events', 
      icon: <EventIcon />, 
      view: 'events',
      description: 'Discover and register for events'
    },
    { 
      label: 'My Events', 
      icon: <AssignmentIcon />, 
      view: 'myevents',
      description: 'Track your registrations'
    },
    { 
      label: 'Feedback Portal', 
      icon: <FeedbackIcon />, 
      view: 'feedback',
      description: 'Submit feedback for attended events',
      badge: userStats.pendingFeedback
    },
    { 
      label: 'My Certificates', 
      icon: <EmojiEventsIcon />, 
      view: 'certificates',
      description: 'Download your certificates',
      badge: userStats.certificates
    },
    { 
      label: 'Profile', 
      icon: <PersonIcon />, 
      view: 'profile',
      description: 'Manage your profile'
    },
    { 
      label: 'Notifications', 
      icon: <NotificationsIcon />, 
      view: 'notifications',
      description: 'View updates and alerts',
      badge: notifications.length
    },
  ];

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch all approved events
      const allEventsResponse = await fetch(`http://localhost:4000/api/participant/events`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let totalEvents = 0;
      if (allEventsResponse.ok) {
        const allEventsData = await allEventsResponse.json();
        totalEvents = allEventsData.length;
      }

      // Fetch my registered events
      const myEventsResponse = await fetch(`http://localhost:4000/api/participant/my-events/${participantId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let attendedEvents = 0;
      let pendingFeedback = 0;
      if (myEventsResponse.ok) {
        const myEventsData = await myEventsResponse.json();
        attendedEvents = myEventsData.filter(event => event.attended).length;
        pendingFeedback = myEventsData.filter(event => event.attended && !event.feedbackGiven).length;

        // Fetch certificates
        const certsResponse = await fetch(`http://localhost:4000/api/participant/certificates/${participantId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let certificates = 0;
        if (certsResponse.ok) {
          const certsData = await certsResponse.json();
          // Handle the new response format with success and data properties
          if (certsData.success && certsData.data) {
            certificates = certsData.data.length;
          } else if (Array.isArray(certsData)) {
            // Fallback for old response format
            certificates = certsData.length;
          }
        }

        setUserStats({
          totalEvents,
          attendedEvents,
          certificates,
          pendingFeedback
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/participant/notifications/${participantId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.filter(notif => !notif.read));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Refresh data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    fetchUserStats();
    fetchNotifications();
  };

  useEffect(() => {
    if (participantId) {
      fetchUserStats();
      fetchNotifications();
    }
  }, [participantId]);

  // Auto-refresh on window focus
  useEffect(() => {
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Handle view change with fade transition
  const handleViewChange = (newView) => {
    if (newView !== view) {
      setFadeIn(false);
      setTimeout(() => {
        setView(newView);
        setFadeIn(true);
      }, 200);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const viewComponents = {
    dashboard: <EnhancedDashboardHome 
      key={`dashboard-${refreshKey}`} 
      userStats={userStats}
      onRefresh={refreshData}
      onNavigate={handleViewChange}
    />,
    events: <EnhancedEventsList 
      key={`events-${refreshKey}`} 
      onDataChange={refreshData} 
    />,
    myevents: <EnhancedMyEvents 
      key={`myevents-${refreshKey}`}
      onDataChange={refreshData}
    />,
    feedback: <EnhancedFeedbackPortal 
      key={`feedback-${refreshKey}`}
      onDataChange={refreshData}
    />,
    certificates: <EnhancedCertificates 
      key={`certificates-${refreshKey}`}
      onDataChange={refreshData}
    />,
    profile: <EnhancedProfile 
      key={`profile-${refreshKey}`}
      onDataChange={refreshData}
    />,
    notifications: <EnhancedNotifications 
      key={`notifications-${refreshKey}`}
      notifications={notifications}
      onDataChange={refreshData}
    />,
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />

        {/* Enhanced Drawer */}
        <Drawer
          variant="permanent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? drawerWidth : 64,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : 64,
              boxSizing: 'border-box',
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              borderRight: 'none',
            },
          }}
        >
          {/* Drawer Header */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {drawerOpen && (
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Participant Portal
              </Typography>
            )}
            <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
              <MenuIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* User Info */}
          {drawerOpen && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mx: 'auto', 
                  mb: 1,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem'
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userEmail}
              </Typography>
              
              {/* Quick Stats */}
              <Grid container spacing={1} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {userStats.totalEvents}
                    </Typography>
                    <Typography variant="caption">Events</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {userStats.certificates}
                    </Typography>
                    <Typography variant="caption">Certificates</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider />

          {/* Navigation Menu */}
          <List sx={{ flexGrow: 1, px: 1 }}>
            {menuItems.map((item) => (
              <Tooltip 
                key={item.label} 
                title={!drawerOpen ? item.description : ''} 
                placement="right"
              >
                <ListItem
                  component="button"
                  onClick={() => handleViewChange(item.view)}
                  selected={view === item.view}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: view === item.view ? 'inherit' : 'text.primary',
                    minWidth: 40 
                  }}>
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText 
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontWeight: view === item.view ? 'bold' : 'normal',
                      }}
                    />
                  )}
                </ListItem>
              </Tooltip>
            ))}
          </List>

          {/* Theme Toggle */}
          {drawerOpen && (
            <Box sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    icon={<LightModeIcon />}
                    checkedIcon={<DarkModeIcon />}
                  />
                }
                label={darkMode ? 'Dark Mode' : 'Light Mode'}
              />
            </Box>
          )}
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Enhanced AppBar */}
          <AppBar 
            position="fixed" 
            sx={{ 
              ml: drawerOpen ? `${drawerWidth}px` : '64px',
              width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : 'calc(100% - 64px)',
              transition: 'margin-left 0.3s ease, width 0.3s ease',
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {menuItems.find(item => item.view === view)?.label || 'Participant Portal'}
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Refresh Data">
                  <IconButton color="inherit" onClick={refreshData}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Notifications">
                  <IconButton 
                    color="inherit" 
                    onClick={() => handleViewChange('notifications')}
                  >
                    <Badge badgeContent={notifications.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Profile">
                  <IconButton onClick={() => handleViewChange('profile')}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {userName.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  variant="outlined"
                  sx={{ ml: 1 }}
                >
                  Logout
                </Button>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Content Area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 8, // Account for AppBar
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <Fade in={fadeIn} timeout={400}>
              <Box>
                {viewComponents[view]}
              </Box>
            </Fade>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EnhancedParticipantDashboard;