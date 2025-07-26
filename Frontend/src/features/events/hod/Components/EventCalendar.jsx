import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Event,
  AccessTime,
  LocationOn,
  Group,
  AttachMoney,
  CheckCircle,
  Schedule,
  Cancel,
  CalendarToday
} from '@mui/icons-material';
import { eventState } from '../../../../shared/context/eventProvider';

const EventCalendar = () => {
  const theme = useTheme();
  const { events } = eventState();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Navigate months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.eventDate || event.startDate);
      return eventDate.getDate() === date &&
             eventDate.getMonth() === currentMonth &&
             eventDate.getFullYear() === currentYear;
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'rejected': return <Cancel />;
      default: return <Event />;
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [currentDate]);

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  // Get today's date
  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear();
  };

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return events.filter(event => {
      const eventDate = new Date(event.eventDate || event.startDate);
      return eventDate >= today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.eventDate || a.startDate) - new Date(b.eventDate || b.startDate));
  }, [events]);

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Event Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage department events in calendar format
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {/* Calendar Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {monthNames[currentMonth]} {currentYear}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => navigateMonth(-1)}>
                  <ChevronLeft />
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Today />}
                  onClick={() => setCurrentDate(new Date())}
                  sx={{ mx: 1 }}
                >
                  Today
                </Button>
                <IconButton onClick={() => navigateMonth(1)}>
                  <ChevronRight />
                </IconButton>
              </Box>
            </Box>

            {/* Day Headers */}
            <Grid container sx={{ mb: 1 }}>
              {dayNames.map(day => (
                <Grid item xs key={day} sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Grid */}
            <Grid container sx={{ minHeight: '400px' }}>
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                
                return (
                  <Grid 
                    item 
                    xs 
                    key={index}
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      minHeight: '80px',
                      p: 0.5,
                      backgroundColor: day && isToday(day) ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                    }}
                  >
                    {day && (
                      <>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: isToday(day) ? 600 : 400,
                            color: isToday(day) ? 'primary.main' : 'text.primary',
                            mb: 0.5
                          }}
                        >
                          {day}
                        </Typography>
                        
                        {dayEvents.map((event, eventIndex) => (
                          <Chip
                            key={eventIndex}
                            label={event.title}
                            size="small"
                            color={getStatusColor(event.status)}
                            onClick={() => handleEventClick(event)}
                            sx={{ 
                              mb: 0.5, 
                              fontSize: '0.7rem',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'block',
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100px'
                              }
                            }}
                          />
                        ))}
                        
                        {dayEvents.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{dayEvents.length - 2} more
                          </Typography>
                        )}
                      </>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Upcoming Events */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="primary" />
              Upcoming Events
            </Typography>
            
            {upcomingEvents.length > 0 ? (
              <List sx={{ p: 0 }}>
                {upcomingEvents.slice(0, 5).map((event, index) => (
                  <React.Fragment key={event._id}>
                    <ListItem 
                      sx={{ px: 0, cursor: 'pointer' }}
                      onClick={() => handleEventClick(event)}
                    >
                      <ListItemIcon>
                        <Badge
                          color={getStatusColor(event.status)}
                          variant="dot"
                          sx={{ '& .MuiBadge-badge': { right: 6, top: 6 } }}
                        >
                          <Event color="primary" />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(event.eventDate || event.startDate).toLocaleDateString()}
                            </Typography>
                            <br />
                            <Chip 
                              size="small" 
                              label={event.status} 
                              color={getStatusColor(event.status)}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < upcomingEvents.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No upcoming events in the next 7 days
              </Typography>
            )}
          </Paper>

          {/* Calendar Legend */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Status Legend
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label="Approved" color="success" />
                <Typography variant="body2" color="text.secondary">
                  Events approved by HOD
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label="Pending" color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Awaiting HOD approval
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip size="small" label="Rejected" color="error" />
                <Typography variant="body2" color="text.secondary">
                  Events rejected by HOD
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Event Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getStatusIcon(selectedEvent.status)}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedEvent.title}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={selectedEvent.status} 
                    color={getStatusColor(selectedEvent.status)}
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AccessTime color="primary" />
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(selectedEvent.eventDate || selectedEvent.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOn color="primary" />
                    <Typography variant="body2">
                      <strong>Venue:</strong> {selectedEvent.venue || 'TBD'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Group color="primary" />
                    <Typography variant="body2">
                      <strong>Expected Participants:</strong> {selectedEvent.expectedParticipants || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AttachMoney color="primary" />
                    <Typography variant="body2">
                      <strong>Budget:</strong> ₹{selectedEvent.budget?.total || 0}
                    </Typography>
                  </Box>
                </Grid>
                
                {selectedEvent.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Description:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.description}
                    </Typography>
                  </Grid>
                )}
                
                {selectedEvent.reviewComments && (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>HOD Comments:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.reviewComments}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  // Navigate to event details page
                  window.open(`/hod/event/${selectedEvent._id}`, '_blank');
                }}
              >
                View Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EventCalendar;