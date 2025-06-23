import React, { useState, useEffect } from 'react';
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
  Fade
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EventIcon from '@mui/icons-material/Event';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FeedbackIcon from '@mui/icons-material/Feedback';
import HomeIcon from '@mui/icons-material/Home';
import PList from './List';
import PForm from './Form';
import FeedbackForm from './Feedback';
import MyEvents from './Myevents';
import MyCertificates from './Mycerts';
import Home from'../../Home/Home';

const drawerWidth = 220;
const backgroundImageUrl = '/Anna_University.jpg';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      paper: '#111',
      default: '#181818',
    },
    primary: {
      main: '#fff',
    },
    text: {
      primary: '#fff',
      secondary: '#aaa',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          '&:active': {
            boxShadow: '0 0 8px #fff3',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'background 0.2s, color 0.2s',
          '&:active': {
            background: 'rgba(255,255,255,0.15)',
          },
        },
      },
    },
  },
});

const menuItems = [
  { label: 'Events List', icon: <EventIcon />, view: 'list' },
  // { label: 'Participant Details', icon: <AddCircleIcon />, view: 'form' }, // commented out to hide from drawer
  { label: 'My Events', icon: <AssignmentTurnedInIcon />, view: 'myevents' },
  { label: 'My Certificates', icon: <EmojiEventsIcon />, view: 'mycerts' },
  { label: 'Feedback', icon: <FeedbackIcon />, view: 'feedback' },
  { label: 'Home', icon: <HomeIcon />, view: 'home' },
];

const ParticipantDashboard = () => {
  const [view, setView] = useState('list');
  const [fadeIn, setFadeIn] = useState(true);
  const [open, setOpen] = useState(true);
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    // Fetch my events for feedback form dropdown
    const participantId = "6857dbb542e87e57a8748a61"; // Or get from context/localStorage
    fetch(`http://localhost:5000/api/participant/my-events/${participantId}`)
      .then(res => res.json())
      .then(data => setMyEvents(data))
      .catch(() => setMyEvents([]));
  }, []);

  const userName = 'Siva';
  const firstLetter = userName.charAt(0).toUpperCase();

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

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // You can handle the feedback submission here
    // Example: send {feedbackEventId, feedbackParticipantId, feedbackRating, feedbackComments} to your backend
    setFeedbackEventId('');
    setFeedbackParticipantId('');
    setFeedbackRating(1);
    setFeedbackComments('');
    alert('Feedback submitted!');
  };

  // Add handler for register form submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    // You can handle the registration logic here
    // Example: send {regName, regRoll, regDept, regYear, regEmail, regPhone, regEvents} to your backend
    setRegName('');
    setRegRoll('');
    setRegDept('');
    setRegYear('');
    setRegEmail('');
    setRegPhone('');
    setRegEvents('');
    alert('Participant registered successfully!');
  };

  const viewComponents = {
    list: <PList />,
    myevents: <MyEvents />,
    mycerts: <MyCertificates />,
    feedback: (
      <FeedbackForm myEvents={myEvents} />
    ),
    home: <Home />,
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', bgcolor: 'background.default' }}>
        <CssBaseline />

        {/* Background Image */}
        <Box
          sx={{
            position: 'fixed',
            zIndex: 0,
            width: '100vw',
            height: '100vh',
            top: 0,
            left: 0,
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        />

        {/* Drawer */}
        <Drawer
          variant="permanent"
          anchor="left"
          open={open}
          sx={{
            width: open ? drawerWidth : 64,
            flexShrink: 0,
            zIndex: 2,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : 64,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              color: 'text.primary',
              transition: 'width 0.3s',
              overflowX: 'hidden',
              borderRight: '1px solid #222',
              backdropFilter: 'blur(2px)',
            },
          }}
        >
          <Toolbar sx={{ justifyContent: open ? 'flex-end' : 'center', px: 1 }}>
            <IconButton onClick={() => setOpen(!open)} color="inherit">
              <MenuIcon />
            </IconButton>
          </Toolbar>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => handleViewChange(item.view)}
                selected={view === item.view}
                sx={{
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                  transition: 'background 0.2s, color 0.2s',
                  ...(view === item.view && {
                    bgcolor: 'rgba(255,255,255,0.12)',
                  }),
                }}
              >
                <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.label} />}
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            ml: open ? `${drawerWidth}px` : '64px',
            width: open ? `calc(100% - ${drawerWidth}px)` : 'calc(100% - 64px)',
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 'none',
            backdropFilter: 'blur(2px)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: 'margin-left 0.3s, width 0.3s',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap>
              Participants Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar>{firstLetter}</Avatar>
              <Button color="inherit">Logout</Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Spacer for AppBar */}
        <Box sx={{ width: '100%', overflowX: 'hidden' }}>
          <Toolbar />
          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              maxWidth: '100vw', // Prevent horizontal scroll
              p: { xs: 1, sm: 3 },
              mt: 2,
              bgcolor: 'rgba(30,30,30,0.35)', // semi-transparent dark
              backdropFilter: 'blur(8px)',    // glass effect
              borderRadius: 2,
              boxShadow: 3,
              position: 'relative',
              zIndex: 1,
              minHeight: 'calc(100vh - 64px - 16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
            }}
          >
            <Fade in={fadeIn} timeout={400} key={view}>
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

export default ParticipantDashboard;
