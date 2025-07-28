import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  CardActions
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  EmojiEvents as CertificateIcon,
  Feedback as FeedbackIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const EnhancedDashboardHome = ({ userStats, onRefresh, onNavigate }) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
  const participantId = userInfo._id;
  const userName = userInfo.name || 'Participant';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch recent activity
      const activityResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/recent-activity/${participantId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.slice(0, 5)); // Show last 5 activities
      }

      // Fetch upcoming events
      const eventsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/events`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        // Update total approved events count
        
        
        const upcoming = eventsData
          .filter(event => new Date(event.startDate) > new Date())
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 3);
        setUpcomingEvents(upcoming);
      }

      // Generate achievements based on user stats
      generateAchievements();
      generateProgressData();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate achievements based on user stats
  const generateAchievements = () => {
    const achievements = [];
    
    if (userStats.totalEvents >= 1) {
      achievements.push({
        title: 'Event Participant',
        description: 'Registered for your first event',
        icon: <EventIcon />,
        color: 'primary',
        earned: true
      });
    }

    if (userStats.attendedEvents >= 1) {
      achievements.push({
        title: 'Active Attendee',
        description: 'Attended your first event',
        icon: <CheckCircleIcon />,
        color: 'success',
        earned: true
      });
    }

    if (userStats.certificates >= 1) {
      achievements.push({
        title: 'Certificate Holder',
        description: 'Earned your first certificate',
        icon: <CertificateIcon />,
        color: 'warning',
        earned: true
      });
    }

    if (userStats.attendedEvents >= 5) {
      achievements.push({
        title: 'Dedicated Learner',
        description: 'Attended 5 or more events',
        icon: <StarIcon />,
        color: 'secondary',
        earned: true
      });
    }

    if (userStats.certificates >= 3) {
      achievements.push({
        title: 'Certificate Collector',
        description: 'Earned 3 or more certificates',
        icon: <TrendingUpIcon />,
        color: 'info',
        earned: true
      });
    }

    setAchievements(achievements);
  };

  // Generate progress data for charts
  const generateProgressData = () => {
    const data = [
      { name: 'Registered', value: userStats.totalEvents, color: '#8884d8' },
      { name: 'Attended', value: userStats.attendedEvents, color: '#82ca9d' },
      { name: 'Certificates', value: userStats.certificates, color: '#ffc658' },
      { name: 'Pending Feedback', value: userStats.pendingFeedback, color: '#ff7300' }
    ];
    setProgressData(data);
  };

  useEffect(() => {
    if (participantId) {
      fetchDashboardData();
    }
  }, [participantId, userStats]);

  // Calculate completion rate
  const completionRate = userStats.totalEvents > 0 
    ? Math.round((userStats.certificates / userStats.totalEvents) * 100) 
    : 0;

  const attendanceRate = userStats.totalEvents > 0 
    ? Math.round((userStats.attendedEvents / userStats.totalEvents) * 100) 
    : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Welcome Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '2rem' }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {userName}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Here's your learning journey overview
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Chip 
                  icon={<EventIcon />} 
                  label={`${userStats.totalEvents} Events`} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  icon={<CertificateIcon />} 
                  label={`${userStats.certificates} Certificates`} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
              >
                Refresh Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                  <EventIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {userStats.totalEvents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Events
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {userStats.attendedEvents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Attended
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'warning.main' }}>
                  <CertificateIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {userStats.certificates}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Certificates
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'info.main' }}>
                  <FeedbackIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {userStats.pendingFeedback}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Feedback
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Progress Overview */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Progress Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Completion Rates
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Attendance Rate</Typography>
                      <Typography variant="body2">{attendanceRate}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={attendanceRate} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Certificate Completion</Typography>
                      <Typography variant="body2">{completionRate}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={completionRate} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Event Statistics
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={`${userStats.totalEvents} Total Events`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary={`${userStats.attendedEvents} Attended`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CertificateIcon color="warning" /></ListItemIcon>
                      <ListItemText primary={`${userStats.certificates} Certificates`} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => onNavigate('events')}
                    sx={{ py: 2 }}
                  >
                    Browse Events
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FeedbackIcon />}
                    onClick={() => onNavigate('feedback')}
                    sx={{ py: 2 }}
                  >
                    <Badge badgeContent={userStats.pendingFeedback} color="error">
                      Submit Feedback
                    </Badge>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CertificateIcon />}
                    onClick={() => onNavigate('certificates')}
                    sx={{ py: 2 }}
                  >
                    My Certificates
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => onNavigate('myevents')}
                    sx={{ py: 2 }}
                  >
                    My Events
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Achievements */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Achievements
              </Typography>
              {achievements.length === 0 ? (
                <Typography color="text.secondary">
                  Start participating in events to earn achievements!
                </Typography>
              ) : (
                <List dense>
                  {achievements.map((achievement, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: `${achievement.color}.main`, width: 32, height: 32 }}>
                          {achievement.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={achievement.title}
                        secondary={achievement.description}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              {upcomingEvents.length === 0 ? (
                <Typography color="text.secondary">
                  No upcoming events. Check the events page for new opportunities!
                </Typography>
              ) : (
                <List dense>
                  {upcomingEvents.map((event) => (
                    <ListItem key={event._id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={new Date(event.startDate).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button 
                fullWidth 
                variant="text" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => onNavigate('events')}
                sx={{ mt: 1 }}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {recentActivity.length === 0 ? (
                <Typography color="text.secondary">
                  No recent activity to show.
                </Typography>
              ) : (
                <List dense>
                  {recentActivity.map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                          {activity.type === 'registration' && <EventIcon sx={{ fontSize: 16 }} />}
                          {activity.type === 'attendance' && <CheckCircleIcon sx={{ fontSize: 16 }} />}
                          {activity.type === 'feedback' && <FeedbackIcon sx={{ fontSize: 16 }} />}
                          {activity.type === 'certificate' && <CertificateIcon sx={{ fontSize: 16 }} />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(activity.date).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Actions Alert */}
      {userStats.pendingFeedback > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mt: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => onNavigate('feedback')}
            >
              Submit Now
            </Button>
          }
        >
          You have {userStats.pendingFeedback} pending feedback(s). Submit them to earn your certificates!
        </Alert>
      )}
    </Box>
  );
};

export default EnhancedDashboardHome;