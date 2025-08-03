import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Avatar,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Tooltip,
  Fab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  Event, 
  CardMembership, 
  People, 
  Menu as MenuIcon, 
  Info, 
  Business, 
  Group, 
  Close,
  KeyboardArrowUp,
  Security,
  CloudQueue,
  Code,
  Psychology,
  DataUsage,
  Web,
  Help,
  MenuBook
} from '@mui/icons-material';
import DashboardGuide from './DashboardGuide';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const teamMembers = [
    { 
      name: 'Siva Sankar S', 
      rollNo: '2023103082',
      batch: '2023-27',
      photo: '' // Photo path to be added later
    },
    { 
      name: 'Dhanush T', 
      rollNo: '2023103507',
      batch: '2023-27',
      photo: '' // Photo path to be added later
    },
    { 
      name: 'Viswa S', 
      rollNo: '2023103564',
      batch: '2023-27',
      photo: '' // Photo path to be added later
    },
    { 
      name: 'Kathir Kalidass B', 
      rollNo: '2023103546',
      batch: '2023-27',
      photo: '' // Photo path to be added later
    },
    { 
      name: 'Magesh Gumar M', 
      rollNo: '2023103612',
      batch: '2023-27',
      photo: '' // Photo path to be added later
    }
  ];

  const features = [
    {
      icon: <Event sx={{ fontSize: 50, color: '#1976d2' }} />,
      title: 'Event Management',
      description: 'Create, manage, and track educational events, workshops, and training programs with comprehensive workflow management.',
      color: '#e3f2fd'
    },
    {
      icon: <CardMembership sx={{ fontSize: 50, color: '#4caf50' }} />,
      title: 'Certificate Generation',
      description: 'Automated certificate generation with QR code verification, digital signatures, and professional templates.',
      color: '#e8f5e8'
    },
    {
      icon: <People sx={{ fontSize: 50, color: '#ff9800' }} />,
      title: 'Multi-Role System',
      description: 'Role-based access control for HODs, Coordinators, and Participants with specific permissions and workflows.',
      color: '#fff3e0'
    },
    {
      icon: <School sx={{ fontSize: 50, color: '#9c27b0' }} />,
      title: 'Anna University Integration',
      description: 'Seamlessly integrated with Anna University systems, official branding, and institutional workflows.',
      color: '#f3e5f5'
    },
  ];

  const techStack = [
    { name: 'React.js', icon: <Code />, color: '#61dafb' },
    { name: 'Node.js', icon: <Web />, color: '#68a063' },
    { name: 'MongoDB', icon: <DataUsage />, color: '#4db33d' },
    { name: 'Material-UI', icon: <Psychology />, color: '#0081cb' },
    { name: 'Express.js', icon: <CloudQueue />, color: '#000000' },
    { name: 'JWT Security', icon: <Security />, color: '#ff6b6b' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Animate cards on load
    setTimeout(() => setAnimateCards(true), 500);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setDrawerOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NavItems = () => (
    <>
      <Button 
        color="inherit" 
        onClick={() => scrollToSection('home')}
        sx={{ 
          mx: 1, 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2
        }}
      >
        Home
      </Button>
      <Button 
        color="inherit" 
        onClick={() => scrollToSection('about-college')}
        sx={{ 
          mx: 1, 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2
        }}
      >
        About College
      </Button>
      <Button 
        color="inherit" 
        onClick={() => scrollToSection('about-department')}
        sx={{ 
          mx: 1, 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2
        }}
      >
        About Department
      </Button>
      <Button 
        color="inherit" 
        onClick={() => scrollToSection('team')}
        sx={{ 
          mx: 1, 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2
        }}
      >
        Team
      </Button>
      <Button 
        color="inherit" 
        onClick={() => scrollToSection('login')}
        sx={{ 
          mx: 1, 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2
        }}
      >
        Login
      </Button>
    </>
  );

  const MobileNavItems = () => (
    <List>
      <ListItem button onClick={() => scrollToSection('home')}>
        <ListItemIcon><School /></ListItemIcon>
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem button onClick={() => scrollToSection('about-college')}>
        <ListItemIcon><Business /></ListItemIcon>
        <ListItemText primary="About College" />
      </ListItem>
      <ListItem button onClick={() => scrollToSection('about-department')}>
        <ListItemIcon><Info /></ListItemIcon>
        <ListItemText primary="About Department" />
      </ListItem>
      <ListItem button onClick={() => scrollToSection('team')}>
        <ListItemIcon><Group /></ListItemIcon>
        <ListItemText primary="Team" />
      </ListItem>
      <ListItem button onClick={() => scrollToSection('login')}>
        <ListItemIcon><Group /></ListItemIcon>
        <ListItemText primary="Login" />
      </ListItem>
    </List>
  );

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ 
        backgroundColor: '#1976d2',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
                overflow: 'hidden'
              }}
            >
              <img 
                src="/anna-university-logo.jpg" 
                alt="Anna University Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
            <Event sx={{ 
              fontSize: 28, 
              color: '#fff', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 0.5,
              mr: 1
            }} />
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Anna University Events Management System
          </Typography>
          
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <NavItems />
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
          <MobileNavItems />
        </Box>
      </Drawer>

      {/* Scroll to Top Button */}
      <Fade in={showScrollTop}>
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Fade>

      {/* Main Content */}
      <Box sx={{ mt: 8 }}>
        {/* Hero Section with Background */}
        <Box 
          id="home" 
          sx={{ 
            py: 12,
            background: 'linear-gradient(135deg, rgba(25,118,210,0.9) 0%, rgba(66,165,245,0.9) 100%), url("/Anna_University.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            {/* University Logos */}
            <Box textAlign="center" mb={4}>
              <Grid container spacing={4} justifyContent="center" alignItems="center">
                <Grid item>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      p: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src="/anna-university-logo.jpg" 
                      alt="Anna University Logo"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ mt: 2, display: 'block', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    Anna University
                  </Typography>
                </Grid>
                <Grid item>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                      p: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src="/CEG_logo.png" 
                      alt="CEG Logo"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ mt: 2, display: 'block', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    CEG
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Fade in timeout={1000}>
              <Box textAlign="center" mb={8}>
                <Typography 
                  variant="h1" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                    mb: 3
                  }}
                >
                  Events Management System
                </Typography>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    opacity: 0.95,
                    mb: 4,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  Anna University - Department of Computer Science and Engineering
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    maxWidth: 800, 
                    mx: 'auto', 
                    mb: 6, 
                    opacity: 0.9,
                    lineHeight: 1.6,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  A comprehensive web application for managing educational events, training programs, 
                  workshops, and certificate courses with professional document generation and multi-role access control.
                </Typography>
              </Box>
            </Fade>

            
            {/* Role Guides Section */}
            <Paper 
              elevation={8} 
              sx={{ 
                p: 6, 
                borderRadius: 4, 
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                mb: 6
              }}
            >
              <Typography 
                variant="h4" 
                component="h3" 
                textAlign="center" 
                gutterBottom 
                sx={{ 
                  mb: 4, 
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}
              >
                Role Guidelines & Responsibilities
              </Typography>
              
              <Grid container spacing={4}>
                {/* HOD Role Guide */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      border: '2px solid #1976d2',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 30px rgba(25,118,210,0.2)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box textAlign="center" mb={2}>
                        <Business sx={{ fontSize: 50, color: '#1976d2', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          HOD (Head of Department)
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        Key Responsibilities:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, color: '#555' }}>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Approve and oversee all departmental events
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Manage event coordinators and their assignments
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Review event proposals and budgets
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Monitor event progress and outcomes
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Generate comprehensive reports
                        </Typography>
                        <Typography component="li" variant="body2">
                          Ensure compliance with university policies
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Coordinator Role Guide */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                      border: '2px solid #4caf50',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 30px rgba(76,175,80,0.2)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box textAlign="center" mb={2}>
                        <People sx={{ fontSize: 50, color: '#4caf50', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          Event Coordinator
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        Key Responsibilities:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, color: '#555' }}>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Create and manage events end-to-end
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Handle participant registrations
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Generate and distribute certificates
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Track attendance and participation
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Collect and analyze feedback
                        </Typography>
                        <Typography component="li" variant="body2">
                          Coordinate with HOD for approvals
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Participant Role Guide */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                      border: '2px solid #ff9800',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 30px rgba(255,152,0,0.2)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box textAlign="center" mb={2}>
                        <Group sx={{ fontSize: 50, color: '#ff9800', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                          Participant
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        Key Activities:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, color: '#555' }}>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Browse and register for events
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          View event details and schedules
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Track registration status
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Download certificates upon completion
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Provide event feedback
                        </Typography>
                        <Typography component="li" variant="body2">
                          Update profile information
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Admin Role Guide */}
                <Grid item xs={12} md={6} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                      border: '2px solid #9c27b0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 30px rgba(156,39,176,0.2)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box textAlign="center" mb={2}>
                        <Security sx={{ fontSize: 50, color: '#9c27b0', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                          System Admin
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                        Key Responsibilities:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, color: '#555' }}>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Manage user accounts and permissions
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          System configuration and maintenance
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Monitor system performance
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Handle technical support requests
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                          Backup and data management
                        </Typography>
                        <Typography component="li" variant="body2">
                          Security and access control
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Enhanced Login Section */}
            <Paper 
              elevation={8} 
              sx={{ 
                p: 6, 
                borderRadius: 4, 
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography 
                variant="h4" 
                component="h3" 
                textAlign="center" 
                gutterBottom 
                sx={{ 
                  mb: 2, 
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}
              >
                Access Your Dashboard
              </Typography>
              
              {/* First Time Login Information */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: 2
                }}
              >
                <Box Box id="login" display="flex" alignItems="center" mb={2}>
                  <Info sx={{ color: '#856404', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#856404' }}>
                    First Time Login Information
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#856404', lineHeight: 1.6 }}>
                  <strong>For first-time users:</strong> Your registered email address is your password. 
                  After your first login, you will be prompted to change your password for security purposes.
                </Typography>
                <Typography variant="body2" sx={{ color: '#856404', mt: 1, fontStyle: 'italic' }}>
                  Example: If your email is john.doe@example.com, use "john.doe@example.com" as your password for the first login.
                </Typography>
              </Paper>

              {/* Password Reset Information */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  backgroundColor: '#e8f5e9',
                  border: '1px solid #c8e6c9',
                  borderRadius: 2
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <Security sx={{ color: '#2e7d32', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    Forgot Your Password?
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: '#2e7d32', lineHeight: 1.6, mb: 2 }}>
                  <strong>Password Reset Process:</strong>
                </Typography>
                <Box component="ol" sx={{ color: '#2e7d32', pl: 3, mb: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Click "Forgot Password" on your role's login page
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Enter your registered email address
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Your request will be sent to admin for approval
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Once approved, your password will be reset to your email address
                  </Typography>
                  
                </Box>
                <Typography variant="body2" sx={{ color: '#2e7d32', fontStyle: 'italic' }}>
                  <strong>Note:</strong> This process requires admin approval for security purposes. Please be patient while your request is processed.
                </Typography>
              </Paper>

              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/login/hod')}
                    startIcon={<Business />}
                    sx={{ 
                      py: 2,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(25,118,210,0.3)'
                      }
                    }}
                  >
                    HOD Login
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/login/coordinator')}
                    startIcon={<People />}
                    sx={{ 
                      py: 2,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(76,175,80,0.3)'
                      }
                    }}
                  >
                    Coordinator Login
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/login/participant')}
                    startIcon={<Group />}
                    sx={{ 
                      py: 2,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(255,152,0,0.3)'
                      }
                    }}
                  >
                    Participant Login
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/admin/login')}
                    startIcon={<Security />}
                    sx={{ 
                      py: 2,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(156,39,176,0.3)'
                      }
                    }}
                  >
                    Admin Login
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Dashboard Guide Section */}
            <Box textAlign="center" sx={{ mt: 6 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setGuideOpen(true)}
                startIcon={<MenuBook />}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  borderWidth: 2,
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25,118,210,0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(25,118,210,0.2)'
                  }
                }}
              >
                📚 Dashboard User Guide - Learn How to Use Each Role
              </Button>
              <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                New to the system? Click above for detailed step-by-step instructions for each role
              </Typography>
            </Box>

          </Container>
        </Box>

        {/* About College Section */}
        <Box id="about-college" sx={{ py: 8, backgroundColor: '#fff' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 4 }}>
              About College of Engineering Guindy
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  College of Engineering Guindy (CEG) is a premier engineering institution and one of the four 
                  constituent colleges of Anna University. Established in 1794, CEG is one of the oldest 
                  technical institutions in India and has a rich legacy of excellence in engineering education.
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  Located in Chennai, Tamil Nadu, CEG has been at the forefront of technological advancement 
                  and innovation. The college offers undergraduate, postgraduate, and doctoral programs across 
                  various engineering disciplines and has produced numerous distinguished alumni who have 
                  made significant contributions to industry and academia worldwide.
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="medium"
                    href="https://annauniv.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<School />}
                    sx={{
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25,118,210,0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(25,118,210,0.2)'
                      }
                    }}
                  >
                    Anna University Official
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    href="https://ceg.annauniv.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Business />}
                    sx={{
                      borderColor: '#4caf50',
                      color: '#4caf50',
                      '&:hover': {
                        borderColor: '#388e3c',
                        backgroundColor: 'rgba(76,175,80,0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(76,175,80,0.2)'
                      }
                    }}
                  >
                    CEG Official Website
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    width: '100%',
                    height: 300,
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    mb: 3
                  }}
                >
                  <img 
                    src="/AnnaUniversityAIIMG.jpg" 
                    alt="Anna University Campus"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Key Highlights
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Established in 1794 - One of India's oldest technical institutions
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Part of Anna University, Chennai
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      NAAC 'A++' Grade accredited institution
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      NBA accredited programs
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Strong industry partnerships and placement record
                    </Typography>
                    <Typography component="li" variant="body2">
                      Active research and innovation ecosystem
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* About Department Section */}
        <Box id="about-department" sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 4 }}>
              Department of Computer Science and Engineering
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  The Department of Computer Science and Engineering (DCSE) at CEG is one of the leading 
                  computer science departments in India. Established with a vision to create world-class 
                  computer science professionals, the department offers comprehensive programs that blend 
                  theoretical foundations with practical applications.
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  Our department is committed to excellence in teaching, research, and innovation. We focus on 
                  emerging technologies including Artificial Intelligence, Machine Learning, Data Science, 
                  Cybersecurity, Cloud Computing, and Software Engineering. The department maintains strong 
                  industry connections and provides students with opportunities for internships, projects, 
                  and placements in top-tier companies.
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  With state-of-the-art laboratories, experienced faculty, and a vibrant research environment, 
                  DCSE continues to be a preferred destination for aspiring computer science engineers and researchers.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    href="https://www.auegov.ac.in/Department/cse"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Web />}
                    sx={{
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25,118,210,0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(25,118,210,0.2)'
                      }
                    }}
                  >
                    Visit Official Department Website
                  </Button>
                </Box>
              </Grid>
              
            </Grid>
          </Container>
        </Box>

        {/* Simplified Team Section */}
        <Box id="team" sx={{ py: 8, backgroundColor: '#fff' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
              Development Team
            </Typography>
            <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: '#666', mb: 6 }}>
              Batch 2023-27 | Department of Computer Science and Engineering, CEG, Anna University
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Zoom in={animateCards} timeout={800 + index * 200}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      transition: 'all 0.3s ease-in-out',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid #e0e0e0',
                      '&:hover': { 
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 12px 35px rgba(25,118,210,0.15)',
                        border: '1px solid #1976d2'
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        {member.photo ? (
                          <Avatar 
                            src={member.photo}
                            alt={member.name}
                            sx={{ 
                              width: 90, 
                              height: 90, 
                              mx: 'auto', 
                              mb: 2,
                              boxShadow: '0 4px 15px rgba(25,118,210,0.3)'
                            }}
                          />
                        ) : (
                          <Avatar 
                            sx={{ 
                              width: 90, 
                              height: 90, 
                              mx: 'auto', 
                              mb: 2, 
                              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                              fontSize: '2.2rem',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 15px rgba(25,118,210,0.3)'
                            }}
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                        )}
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                          {member.name}
                        </Typography>
                        <Chip 
                          label={member.rollNo} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#e3f2fd', 
                            color: '#1976d2',
                            fontWeight: 'bold',
                            mb: 1
                          }} 
                        />
                        <br />
                        <Chip 
                          label={`Batch ${member.batch}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            borderColor: '#4caf50',
                            color: '#4caf50',
                            fontWeight: 'bold',
                            mb: 1
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          B.E. Computer Science & Engineering
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>

            
          </Container>
        </Box>

        {/* Enhanced Footer */}
        <Box sx={{ 
          py: 6, 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
          color: 'white' 
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src="/anna-university-logo.jpg" 
                      alt="Anna University Logo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
                    Events Management System
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Department of Computer Science and Engineering<br />
                  College of Engineering Guindy, Anna University<br />
                  Chennai, Tamil Nadu, India
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} textAlign={{ xs: 'center', md: 'right' }}>
                <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                  © 2025 Anna University. All rights reserved.
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Developed by Batch 2023-27 DCSE Students
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Dashboard Guide Dialog */}
      <DashboardGuide 
        open={guideOpen} 
        onClose={() => setGuideOpen(false)} 
      />
    </Box>
  );
};

export default Home;