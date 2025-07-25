import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Tooltip,
  Badge,
  Divider,
  Stack
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Feedback as FeedbackIcon,
  EmojiEvents as CertificateIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const EnhancedMyEvents = ({ onDataChange }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
  const participantId = userInfo._id;

  // Fetch my events
  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`http://10.5.12.1:4000/api/participant/my-events/${participantId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyEvents(data);
      } else {
        enqueueSnackbar('Error fetching your events', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching my events:', error);
      enqueueSnackbar('Network error', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (participantId) {
      fetchMyEvents();
    }
  }, [participantId]);

  // Get status info
  const getStatusInfo = (event) => {
    if (event.approved === true) {
      if (event.attended) {
        if (event.feedbackGiven) {
          if (event.certificateGenerated) {
            return {
              status: 'completed',
              label: 'Completed',
              color: 'success',
              icon: <CertificateIcon />,
              description: 'Event completed with certificate'
            };
          } else {
            return {
              status: 'feedback_given',
              label: 'Feedback Submitted',
              color: 'info',
              icon: <FeedbackIcon />,
              description: 'Feedback submitted, certificate pending'
            };
          }
        } else {
          return {
            status: 'attended',
            label: 'Attended',
            color: 'warning',
            icon: <CheckCircleIcon />,
            description: 'Attended, feedback required for certificate'
          };
        }
      } else {
        const eventDate = new Date(event.eventId?.startDate);
        const now = new Date();
        if (eventDate > now) {
          return {
            status: 'approved',
            label: 'Approved',
            color: 'success',
            icon: <CheckCircleIcon />,
            description: 'Registration approved, event upcoming'
          };
        } else {
          return {
            status: 'missed',
            label: 'Missed',
            color: 'error',
            icon: <CancelIcon />,
            description: 'Event date passed, attendance not marked'
          };
        }
      }
    } else if (event.approved === false && event.rejectionReason) {
      return {
        status: 'rejected',
        label: 'Rejected',
        color: 'error',
        icon: <CancelIcon />,
        description: event.rejectionReason
      };
    } else {
      return {
        status: 'pending',
        label: 'Pending Approval',
        color: 'warning',
        icon: <ScheduleIcon />,
        description: 'Awaiting coordinator approval'
      };
    }
  };

  // Filter events by tab
  const getFilteredEvents = () => {
    switch (tabValue) {
      case 0: // All
        return myEvents;
      case 1: // Approved
        return myEvents.filter(event => event.approved === true);
      case 2: // Pending
        return myEvents.filter(event => event.approved !== true && !event.rejectionReason);
      case 3: // Attended
        return myEvents.filter(event => event.attended === true);
      case 4: // Completed (with certificates)
        return myEvents.filter(event => event.certificateGenerated === true);
      default:
        return myEvents;
    }
  };

  const filteredEvents = getFilteredEvents();

  // Calculate statistics
  const stats = {
    total: myEvents.length,
    approved: myEvents.filter(e => e.approved === true).length,
    pending: myEvents.filter(e => e.approved !== true && !e.rejectionReason).length,
    attended: myEvents.filter(e => e.attended === true).length,
    completed: myEvents.filter(e => e.certificateGenerated === true).length,
    pendingFeedback: myEvents.filter(e => e.attended === true && !e.feedbackGiven).length
  };

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <AssignmentIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                My Events
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Track your event registrations and progress
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.approved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {stats.attended}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Attended
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
              {stats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Badge badgeContent={stats.pendingFeedback} color="error">
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.pendingFeedback}
              </Typography>
            </Badge>
            <Typography variant="body2" color="text.secondary">
              Need Feedback
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Feedback Alert */}
      {stats.pendingFeedback > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              Submit Feedback
            </Button>
          }
        >
          You have {stats.pendingFeedback} event(s) waiting for feedback. Submit feedback to earn your certificates!
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Approved (${stats.approved})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Attended (${stats.attended})`} />
          <Tab label={`Completed (${stats.completed})`} />
        </Tabs>
      </Paper>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'grey.300', width: 80, height: 80 }}>
              <EventIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              No Events Found
            </Typography>
            <Typography color="text.secondary">
              {tabValue === 0 
                ? "You haven't registered for any events yet."
                : "No events match the selected filter."
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => {
            const statusInfo = getStatusInfo(event);
            const eventDate = new Date(event.eventId?.startDate);
            const isUpcoming = eventDate > new Date();

            return (
              <Grid item xs={12} md={6} lg={4} key={event._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {/* Event Header */}
                  <Box 
                    sx={{ 
                      height: 100,
                      background: `linear-gradient(135deg, ${statusInfo.color === 'success' ? '#4caf50' : 
                                                                statusInfo.color === 'warning' ? '#ff9800' :
                                                                statusInfo.color === 'error' ? '#f44336' :
                                                                statusInfo.color === 'info' ? '#2196f3' : '#9c27b0'} 0%, 
                                                                ${statusInfo.color === 'success' ? '#66bb6a' : 
                                                                statusInfo.color === 'warning' ? '#ffb74d' :
                                                                statusInfo.color === 'error' ? '#ef5350' :
                                                                statusInfo.color === 'info' ? '#42a5f5' : '#ba68c8'} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      color: 'white'
                    }}
                  >
                    {statusInfo.icon && React.cloneElement(statusInfo.icon, { sx: { fontSize: 40, opacity: 0.8 } })}
                    
                    {/* Status Chip */}
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />

                    {/* Upcoming Badge */}
                    {isUpcoming && event.approved === true && (
                      <Chip
                        label="Upcoming"
                        color="info"
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8 }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {event.eventId?.title || 'Event Title'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2 }}
                    >
                      {statusInfo.description}
                    </Typography>

                    {/* Event Progress Timeline */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Progress Timeline
                      </Typography>
                      <Stack spacing={1}>
                        {/* Registration */}
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                            <CalendarIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Registered
                            </Typography>
                            <Typography variant="body2">
                              {new Date(event.registrationDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Approval */}
                        {event.approved === true && (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                              <CheckCircleIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Approved
                              </Typography>
                              <Typography variant="body2">
                                {event.approvedDate ? new Date(event.approvedDate).toLocaleDateString() : 'Approved'}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Attendance */}
                        {event.attended && (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'info.main' }}>
                              <EventIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Attended
                              </Typography>
                              <Typography variant="body2">
                                {event.attendanceMarkedDate ? new Date(event.attendanceMarkedDate).toLocaleDateString() : 'Attended'}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Feedback */}
                        {event.feedbackGiven && (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>
                              <FeedbackIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Feedback Given
                              </Typography>
                              <Typography variant="body2">
                                {event.feedbackDate ? new Date(event.feedbackDate).toLocaleDateString() : 'Submitted'}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Certificate */}
                        {event.certificateGenerated && (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                              <CertificateIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Certificate Earned
                              </Typography>
                              <Typography variant="body2">
                                {event.certificateGeneratedDate ? new Date(event.certificateGeneratedDate).toLocaleDateString() : 'Generated'}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* Event Details */}
                    <Divider sx={{ my: 2 }} />
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CalendarIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={eventDate.toLocaleDateString()}
                          secondary={eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      
                      {event.eventId?.location && (
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <LocationIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={event.eventId.location}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<InfoIcon />}
                      onClick={() => {
                        setSelectedEvent(event);
                        setDetailsDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Event Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <EventIcon color="primary" />
                {selectedEvent.eventId?.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Event Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CalendarIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Start Date"
                        secondary={new Date(selectedEvent.eventId?.startDate).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarIcon /></ListItemIcon>
                      <ListItemText 
                        primary="End Date"
                        secondary={new Date(selectedEvent.eventId?.endDate).toLocaleString()}
                      />
                    </ListItem>
                    {selectedEvent.eventId?.location && (
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Location"
                          secondary={selectedEvent.eventId.location}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Registration Status
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AssignmentIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Registration Date"
                        secondary={new Date(selectedEvent.registrationDate).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>{getStatusInfo(selectedEvent).icon}</ListItemIcon>
                      <ListItemText 
                        primary="Status"
                        secondary={getStatusInfo(selectedEvent).description}
                      />
                    </ListItem>
                    {selectedEvent.rejectionReason && (
                      <ListItem>
                        <ListItemIcon><CancelIcon color="error" /></ListItemIcon>
                        <ListItemText 
                          primary="Rejection Reason"
                          secondary={selectedEvent.rejectionReason}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {selectedEvent.eventId?.description && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedEvent.eventId.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EnhancedMyEvents;