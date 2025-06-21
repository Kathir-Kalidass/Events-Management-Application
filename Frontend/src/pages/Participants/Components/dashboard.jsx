import React, { useState } from 'react';
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
  { label: 'Register an event', icon: <AddCircleIcon />, view: 'form' },
  { label: 'My Events', icon: <AssignmentTurnedInIcon />, view: 'myevents' },
  { label: 'My Certificates', icon: <EmojiEventsIcon />, view: 'mycerts' },
  { label: 'Feedback', icon: <FeedbackIcon />, view: 'feedback' },
  { label: 'Home', icon: <HomeIcon />, view: 'home' },
];

const ParticipantDashboard = () => {
  const [view, setView] = useState('list');
  const [fadeIn, setFadeIn] = useState(true);
  const [open, setOpen] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(1); // Default to 1
  const [feedbackEventId, setFeedbackEventId] = useState('');
  const [feedbackParticipantId, setFeedbackParticipantId] = useState('');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [regName, setRegName] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regYear, setRegYear] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEvents, setRegEvents] = useState('');
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
    form: (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        width: '100%',
      }}>
        <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>Add a New Participant</Typography>
        <Box
          component="form"
          onSubmit={handleRegisterSubmit}
          sx={{
            width: { xs: '100%', sm: 500 },
            bgcolor: 'rgba(30,30,30,0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            boxShadow: 3,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={regName}
            onChange={e => setRegName(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <input
            type="text"
            placeholder="Roll no"
            value={regRoll}
            onChange={e => setRegRoll(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <input
            type="text"
            placeholder="Department"
            value={regDept}
            onChange={e => setRegDept(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <input
            type="text"
            placeholder="Year"
            value={regYear}
            onChange={e => setRegYear(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={regEmail}
            onChange={e => setRegEmail(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={regPhone}
            onChange={e => setRegPhone(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <input
            type="text"
            placeholder="Events to Participate"
            value={regEvents}
            onChange={e => setRegEvents(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            SUBMIT
          </Button>
        </Box>
      </Box>
    ),
    myevents: <MyEvents />,
    mycerts: <MyCertificates />,
    feedback: (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        width: '100%',
      }}>
        <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>Feedback Form</Typography>
        <Box
          component="form"
          onSubmit={handleFeedbackSubmit}
          sx={{
            width: { xs: '100%', sm: 500 },
            bgcolor: 'rgba(30,30,30,0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            boxShadow: 3,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <input
            type="text"
            placeholder="Event ID"
            value={feedbackEventId}
            onChange={e => setFeedbackEventId(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <input
            type="text"
            placeholder="Participant ID"
            value={feedbackParticipantId}
            onChange={e => setFeedbackParticipantId(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
            }}
            required
          />
          <label style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>
            Rating (1–5)
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={feedbackRating}
            onChange={e => {
              const val = Math.max(1, Math.min(5, Number(e.target.value)));
              setFeedbackRating(val);
            }}
            style={{
              width: 80,
              fontSize: 18,
              padding: 8,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              textAlign: 'center',
              marginBottom: 8,
            }}
            required
          />
          <textarea
            placeholder="Comments"
            value={feedbackComments}
            onChange={e => setFeedbackComments(e.target.value)}
            rows={4}
            style={{
              padding: 10,
              borderRadius: 4,
              border: '1px solid #888',
              background: 'rgba(40,40,40,0.7)',
              color: '#fff',
              fontSize: 16,
              marginBottom: 8,
              resize: 'vertical',
            }}
          />
          <Button type="submit" variant="contained" color="primary">
            SUBMIT FEEDBACK
          </Button>
        </Box>
      </Box>
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
