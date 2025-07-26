import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
  alpha,
  Grid,
  TextField,
  Avatar,
  Paper,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  Business,
  Work,
  LocationOn,
  CalendarToday,
  Badge,
  Security,
  Notifications,
  Settings,
  EventNote,
  Assessment,
  TrendingUp
} from '@mui/icons-material';
import { eventState } from '../../../../shared/context/eventProvider';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Memoized input field component
const OptimizedTextField = memo(({ 
  label, 
  value, 
  onChange, 
  disabled, 
  icon: Icon, 
  type = 'text',
  multiline = false,
  rows = 1,
  placeholder = '',
  ...props 
}) => (
  <TextField
    fullWidth
    label={label}
    value={value || ''}
    onChange={onChange}
    disabled={disabled}
    type={type}
    multiline={multiline}
    rows={rows}
    placeholder={placeholder}
    InputProps={{
      startAdornment: Icon ? <Icon sx={{ mr: 1, color: 'text.secondary' }} /> : null
    }}
    InputLabelProps={type === 'date' ? { shrink: true } : undefined}
    {...props}
  />
));

// Memoized stats card component
const StatsCard = memo(({ icon: Icon, value, label, color }) => (
  <Grid item xs={12} md={3}>
    <Card sx={{ textAlign: 'center', p: 2 }}>
      <CardContent>
        <Icon sx={{ fontSize: 40, color: `${color}.main`, mb: 1 }} />
        <Typography variant="h4" sx={{ fontWeight: 600, color: `${color}.main` }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
));

// Memoized tab panel component
const TabPanel = memo(({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
));

const ProfileDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const { user, setUser } = eventState();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    employeeId: '',
    joiningDate: '',
    address: '',
    bio: '',
    specializations: [],
    qualifications: []
  });
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalParticipants: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:4000/api/coordinator/profile/stats',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  }, []);

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:4000/api/coordinator/profile/recent-activities',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentActivities(response.data.activities || []);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      // Fallback to empty array if API fails
      setRecentActivities([]);
    }
  }, []);

  // Initialize profile data when dialog opens
  useEffect(() => {
    if (user && open) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || '',
        department: user.department || 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)',
        employeeId: user.employeeId || '',
        joiningDate: user.joiningDate || '',
        address: user.address || '',
        bio: user.bio || '',
        specializations: user.specializations || [],
        qualifications: user.qualifications || []
      });
      fetchUserStats();
      fetchRecentActivities();
    }
  }, [user, open, fetchUserStats, fetchRecentActivities]);

  // Optimized input change handler
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Memoized save profile handler
  const handleSaveProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!profileData.name || !profileData.email) {
        enqueueSnackbar('Name and email are required fields', { variant: 'error' });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
        return;
      }

      const response = await axios.put(
        'http://localhost:4000/api/coordinator/profile',
        profileData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        setEditMode(false);
        enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details.map(d => d.message).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [profileData, setUser, enqueueSnackbar]);

  // Memoized handlers
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);

  // Helper function to get icon and color for activity type
  const getActivityIcon = useCallback((activityType) => {
    switch (activityType?.toLowerCase()) {
      case 'event_created':
      case 'created_event':
        return { icon: EventNote, color: 'primary' };
      case 'participant_approved':
      case 'approved_participants':
        return { icon: Person, color: 'success' };
      case 'report_generated':
      case 'generated_report':
        return { icon: Assessment, color: 'info' };
      case 'event_updated':
      case 'updated_event':
        return { icon: Edit, color: 'warning' };
      case 'event_cancelled':
      case 'cancelled_event':
        return { icon: Cancel, color: 'error' };
      default:
        return { icon: EventNote, color: 'primary' };
    }
  }, []);

  // Helper function to format relative time
  const formatRelativeTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInMinutes > 0) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    } else {
      return 'Just now';
    }
  }, []);

  // Memoized basic info fields
  const basicInfoFields = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="name"
          label="Full Name"
          value={profileData.name}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Person}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="email"
          label="Email Address"
          value={profileData.email}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Email}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="phone"
          label="Phone Number"
          value={profileData.phone}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Phone}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="employeeId"
          label="Employee ID"
          value={profileData.employeeId}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Badge}
        />
      </Grid>
    </Grid>
  ), [profileData.name, profileData.email, profileData.phone, profileData.employeeId, editMode, handleInputChange]);

  // Memoized professional info fields
  const professionalInfoFields = useMemo(() => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="designation"
          label="Designation"
          value={profileData.designation}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Work}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="department"
          label="Department"
          value={profileData.department}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={Business}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="joiningDate"
          label="Joining Date"
          type="date"
          value={profileData.joiningDate}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={CalendarToday}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <OptimizedTextField
          name="address"
          label="Address"
          value={profileData.address}
          onChange={handleInputChange}
          disabled={!editMode}
          icon={LocationOn}
        />
      </Grid>
      <Grid item xs={12}>
        <OptimizedTextField
          name="bio"
          label="Bio / About"
          value={profileData.bio}
          onChange={handleInputChange}
          disabled={!editMode}
          multiline
          rows={3}
          placeholder="Tell us about yourself, your expertise, and interests..."
        />
      </Grid>
    </Grid>
  ), [profileData.designation, profileData.department, profileData.joiningDate, profileData.address, profileData.bio, editMode, handleInputChange]);

  // Memoized stats cards
  const statsCards = useMemo(() => (
    <Grid container spacing={3}>
      <StatsCard icon={EventNote} value={stats.totalEvents} label="Total Events" color="primary" />
      <StatsCard icon={TrendingUp} value={stats.activeEvents} label="Active Events" color="success" />
      <StatsCard icon={Assessment} value={stats.completedEvents} label="Completed Events" color="info" />
      <StatsCard icon={Person} value={stats.totalParticipants} label="Total Participants" color="warning" />
    </Grid>
  ), [stats]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60,
              backgroundColor: theme.palette.primary.main,
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
              {editMode ? 'Edit Profile' : 'Coordinator Profile'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your personal information and preferences
            </Typography>
          </Box>
          <IconButton
            onClick={toggleEditMode}
            color="primary"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            {editMode ? <Cancel /> : <Edit />}
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            px: 3
          }}
        >
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Assessment />} label="Statistics" />
          <Tab icon={<Settings />} label="Preferences" />
        </Tabs>

        {/* Personal Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" />
                    Basic Information
                  </Typography>
                  {basicInfoFields}
                </Paper>
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work color="primary" />
                    Professional Information
                  </Typography>
                  {professionalInfoFields}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            {statsCards}

            <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Typography>
              <List>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
                    return (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ActivityIcon color={color} />
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description || activity.title || 'Activity'}
                          secondary={formatRelativeTime(activity.createdAt || activity.date)}
                        />
                      </ListItem>
                    );
                  })
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="Your recent activities will appear here"
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings color="primary" />
                Account Preferences
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Customize your account settings and preferences
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive email updates about events and activities"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventNote />
                  </ListItemIcon>
                  <ListItemText
                    primary="Event Reminders"
                    secondary="Get notified about upcoming events and deadlines"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.background.default, 0.5),
          gap: 2
        }}
      >
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: 2,
            px: 3,
            textTransform: 'none'
          }}
        >
          Close
        </Button>
        
        {editMode && (
          <>
            <Button
              onClick={toggleEditMode}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <LinearProgress size={20} /> : <Save />}
              sx={{ 
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;