import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Feedback as FeedbackIcon,
  Event as EventIcon,
  EmojiEvents as CertificateIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const sampleNotifications = [
  {
    _id: '1',
    title: 'No Notifications Found',
    message: 'You have no notifications at this time.',
    type: 'info',
    date: new Date().toISOString(),
    read: false,
    priority: 'low'
  }
];

const EnhancedNotifications = ({ notifications = [], onDataChange }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuNotification, setMenuNotification] = useState(null);

  // Sample notifications if none provided
  
  const allNotifications = notifications.length > 0 ? notifications : sampleNotifications;

  // Filter notifications by tab
  const getFilteredNotifications = () => {
    switch (tabValue) {
      case 0: // All
        return allNotifications;
      case 1: // Unread
        return allNotifications.filter(n => !n.read);
      case 2: // Feedback
        return allNotifications.filter(n => n.type === 'feedback_pending');
      case 3: // Events
        return allNotifications.filter(n => n.type.includes('event'));
      default:
        return allNotifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'feedback_pending':
        return <FeedbackIcon color="warning" />;
      case 'event_reminder':
        return <EventIcon color="primary" />;
      case 'certificate_ready':
        return <CertificateIcon color="success" />;
      case 'registration_approved':
        return <CheckCircleIcon color="success" />;
      case 'registration_rejected':
        return <WarningIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDetailsDialog(true);
    
    // Mark as read if not already
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        onDataChange?.();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/notifications/${userInfo._id}/mark-all-read`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        enqueueSnackbar('All notifications marked as read', { variant: 'success' });
        onDataChange?.();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      enqueueSnackbar('Error updating notifications', { variant: 'error' });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        enqueueSnackbar('Notification deleted', { variant: 'success' });
        onDataChange?.();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      enqueueSnackbar('Error deleting notification', { variant: 'error' });
    }
  };

  // Handle menu actions
  const handleMenuClick = (event, notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuNotification(null);
  };

  const unreadCount = allNotifications.filter(n => !n.read).length;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ fontSize: 32 }} />
              </Badge>
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Notifications
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Stay updated with your events and activities
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      {unreadCount > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          }
        >
          You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${allNotifications.length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label={`Feedback (${allNotifications.filter(n => n.type === 'feedback_pending').length})`} />
          <Tab label={`Events (${allNotifications.filter(n => n.type.includes('event')).length})`} />
        </Tabs>
      </Paper>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'grey.300', width: 80, height: 80 }}>
              <NotificationsIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              No Notifications
            </Typography>
            <Typography color="text.secondary">
              {tabValue === 0 
                ? "You're all caught up! No notifications to show."
                : "No notifications match the selected filter."
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  sx={{
                    cursor: 'pointer',
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    },
                    borderLeft: notification.read ? 'none' : '4px solid',
                    borderLeftColor: `${getPriorityColor(notification.priority)}.main`
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={notification.read ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="New" color="primary" size="small" />
                        )}
                        <Chip 
                          label={notification.priority} 
                          color={getPriorityColor(notification.priority)} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.secondary" component="span" display="block">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span" display="block">
                          {new Date(notification.date).toLocaleString()}
                        </Typography>
                      </React.Fragment>
                    }
                  />

                  <IconButton
                    onClick={(e) => handleMenuClick(e, notification)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItem>
                
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuNotification && !menuNotification.read && (
          <MenuItem onClick={() => {
            markAsRead(menuNotification._id);
            handleMenuClose();
          }}>
            <MarkEmailReadIcon sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          deleteNotification(menuNotification?._id);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Notification Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                {getNotificationIcon(selectedNotification.type)}
                {selectedNotification.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedNotification.message}
              </Typography>
              
              <Box display="flex" gap={1} mb={2}>
                <Chip 
                  label={selectedNotification.type.replace('_', ' ')} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={selectedNotification.priority} 
                  color={getPriorityColor(selectedNotification.priority)} 
                  size="small" 
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Received: {new Date(selectedNotification.date).toLocaleString()}
              </Typography>

              {/* Action buttons based on notification type */}
              {selectedNotification.type === 'feedback_pending' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Submit your feedback to earn your certificate for this event.
                  </Typography>
                </Alert>
              )}

              {selectedNotification.type === 'certificate_ready' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Your certificate is ready! You can download it from the certificates section.
                  </Typography>
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>
                Close
              </Button>
              
              {selectedNotification.type === 'feedback_pending' && (
                <Button variant="contained" startIcon={<FeedbackIcon />}>
                  Submit Feedback
                </Button>
              )}
              
              {selectedNotification.type === 'certificate_ready' && (
                <Button variant="contained" startIcon={<CertificateIcon />}>
                  View Certificate
                </Button>
              )}
              
              {selectedNotification.type === 'event_reminder' && (
                <Button variant="contained" startIcon={<EventIcon />}>
                  View Event
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EnhancedNotifications;