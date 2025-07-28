import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Pagination,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  CardActions,
  CardMedia,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const EnhancedEventsList = ({ onDataChange }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const eventsPerPage = 6;

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
  const participantId = userInfo._id;

  // Fetch events and registrations
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch all events
      const eventsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/events`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }

      // Fetch my registrations
      const registrationsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/my-events/${participantId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (registrationsResponse.ok) {
        const registrationsData = await registrationsResponse.json();
        setMyRegistrations(registrationsData);
      }

    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('Error fetching events', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [participantId]);

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      switch (statusFilter) {
        case 'upcoming':
          filtered = filtered.filter(event => new Date(event.startDate) > now);
          break;
        case 'ongoing':
          filtered = filtered.filter(event => 
            new Date(event.startDate) <= now && new Date(event.endDate) >= now
          );
          break;
        case 'completed':
          filtered = filtered.filter(event => new Date(event.endDate) < now);
          break;
        case 'registered':
          const registeredEventIds = myRegistrations.map(reg => reg.eventId._id);
          filtered = filtered.filter(event => registeredEventIds.includes(event._id));
          break;
      }
    }

    // Apply tab filter
    const now = new Date();
    switch (tabValue) {
      case 0: // All events
        break;
      case 1: // Upcoming
        filtered = filtered.filter(event => new Date(event.startDate) > now);
        break;
      case 2: // My Registrations
        const registeredEventIds = myRegistrations.map(reg => reg.eventId._id);
        filtered = filtered.filter(event => registeredEventIds.includes(event._id));
        break;
      case 3: // Bookmarked
        filtered = filtered.filter(event => bookmarkedEvents.includes(event._id));
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
        break;
    }

    setFilteredEvents(filtered);
    setPage(1); // Reset to first page when filters change
  }, [events, searchTerm, categoryFilter, statusFilter, sortBy, tabValue, myRegistrations, bookmarkedEvents]);

  // Get registration status for an event
  const getRegistrationStatus = (eventId) => {
    const registration = myRegistrations.find(reg => reg.eventId._id === eventId);
    if (!registration) return null;
    
    if (registration.approved === true) return 'approved';
    if (registration.approved === false && registration.rejectionReason) return 'rejected';
    return 'pending';
  };

  // Check if event is full
  const isEventFull = (event) => {
    return event.maxParticipants && event.registeredCount >= event.maxParticipants;
  };

  // Check if registration is still open
  const isRegistrationOpen = (event) => {
    const now = new Date();
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.startDate);
    return now < registrationDeadline;
  };

  // Handle event registration
  const handleRegister = async (eventId) => {
    try {
      setRegistering(eventId);
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/participant/register`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          participantId,
          eventId
        }),
      });

      if (response.ok) {
        enqueueSnackbar('Registration successful! Awaiting approval.', { variant: 'success' });
        fetchEvents();
        onDataChange?.();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Registration failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
    } finally {
      setRegistering(null);
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = (eventId) => {
    setBookmarkedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  // Get event status chip
  const getEventStatusChip = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) {
      return <Chip label="Completed" color="default" size="small" />;
    } else if (startDate <= now && endDate >= now) {
      return <Chip label="Ongoing" color="success" size="small" />;
    } else {
      return <Chip label="Upcoming" color="primary" size="small" />;
    }
  };

  // Get registration status chip
  const getRegistrationChip = (eventId) => {
    const status = getRegistrationStatus(eventId);
    if (!status) return null;

    const chipProps = {
      approved: { label: 'Approved', color: 'success', icon: <CheckCircleIcon /> },
      pending: { label: 'Pending', color: 'warning', icon: <PendingIcon /> },
      rejected: { label: 'Rejected', color: 'error', icon: <CancelIcon /> }
    };

    const props = chipProps[status];
    return <Chip {...props} size="small" />;
  };

  // Get unique categories
  const categories = [...new Set(events.map(event => event.category).filter(Boolean))];

  // Paginate events
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * eventsPerPage,
    page * eventsPerPage
  );

  if (loading) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
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
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <EventIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Discover Events
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Explore and register for exciting learning opportunities
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  startAdornment={<FilterIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="registered">My Registrations</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={<SortIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="popularity">Popularity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredEvents.length} events found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All Events (${events.length})`} />
          <Tab label={`Upcoming (${events.filter(e => new Date(e.startDate) > new Date()).length})`} />
          <Tab label={`My Registrations (${myRegistrations.length})`} />
          <Tab label={`Bookmarked (${bookmarkedEvents.length})`} />
        </Tabs>
      </Paper>

      {/* Events Grid */}
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
              Try adjusting your search criteria or check back later for new events.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedEvents.map((event) => {
              const registrationStatus = getRegistrationStatus(event._id);
              const isBookmarked = bookmarkedEvents.includes(event._id);
              const eventFull = isEventFull(event);
              const registrationOpen = isRegistrationOpen(event);

              return (
                <Grid item xs={12} md={6} lg={4} key={event._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {/* Event Image/Header */}
                    <Box 
                      sx={{ 
                        height: 120,
                        background: `linear-gradient(135deg, ${event.color || '#667eea'} 0%, ${event.color2 || '#764ba2'} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      <EventIcon sx={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
                      
                      {/* Bookmark Button */}
                      <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
                        onClick={() => handleBookmarkToggle(event._id)}
                      >
                        {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>

                      {/* Status Chips */}
                      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                        {getEventStatusChip(event)}
                      </Box>
                    </Box>

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {event.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {event.description}
                      </Typography>

                      {/* Event Details */}
                      <List dense sx={{ py: 0 }}>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CalendarIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={new Date(event.startDate).toLocaleDateString()}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <AccessTimeIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`${new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>

                        {event.location && (
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <LocationIcon fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={event.location}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        )}

                        {event.maxParticipants && (
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <GroupIcon fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`${event.registeredCount || 0}/${event.maxParticipants} participants`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        )}
                      </List>

                      {/* Registration Status */}
                      {registrationStatus && (
                        <Box sx={{ mt: 1 }}>
                          {getRegistrationChip(event._id)}
                        </Box>
                      )}

                      {/* Warnings */}
                      {eventFull && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Event is full
                        </Alert>
                      )}
                      
                      {!registrationOpen && !registrationStatus && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Registration closed
                        </Alert>
                      )}
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                          setSelectedEvent(event);
                          setDetailsDialog(true);
                        }}
                      >
                        Details
                      </Button>

                      {!registrationStatus && registrationOpen && !eventFull && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleRegister(event._id)}
                          disabled={registering === event._id}
                          sx={{ ml: 'auto' }}
                        >
                          {registering === event._id ? 'Registering...' : 'Register'}
                        </Button>
                      )}

                      {registrationStatus === 'approved' && (
                        <Chip 
                          label="Registered" 
                          color="success" 
                          size="small"
                          sx={{ ml: 'auto' }}
                        />
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          {filteredEvents.length > eventsPerPage && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={Math.ceil(filteredEvents.length / eventsPerPage)}
                page={page}
                onChange={(e, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
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
                {selectedEvent.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedEvent.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Event Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CalendarIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Start Date"
                        secondary={new Date(selectedEvent.startDate).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarIcon /></ListItemIcon>
                      <ListItemText 
                        primary="End Date"
                        secondary={new Date(selectedEvent.endDate).toLocaleString()}
                      />
                    </ListItem>
                    {selectedEvent.location && (
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Location"
                          secondary={selectedEvent.location}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Registration Info
                  </Typography>
                  <List dense>
                    {selectedEvent.maxParticipants && (
                      <ListItem>
                        <ListItemIcon><GroupIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Capacity"
                          secondary={`${selectedEvent.registeredCount || 0}/${selectedEvent.maxParticipants} participants`}
                        />
                      </ListItem>
                    )}
                    {selectedEvent.registrationDeadline && (
                      <ListItem>
                        <ListItemIcon><ScheduleIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Registration Deadline"
                          secondary={new Date(selectedEvent.registrationDeadline).toLocaleString()}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {selectedEvent.organizer && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Organizer
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {selectedEvent.organizer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedEvent.organizer.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>
                Close
              </Button>
              {!getRegistrationStatus(selectedEvent._id) && 
               isRegistrationOpen(selectedEvent) && 
               !isEventFull(selectedEvent) && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleRegister(selectedEvent._id);
                    setDetailsDialog(false);
                  }}
                  disabled={registering === selectedEvent._id}
                >
                  Register Now
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EnhancedEventsList;