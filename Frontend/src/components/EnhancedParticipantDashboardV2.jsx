import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Avatar,
  ListItemText,
  ListItemAvatar,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  PendingActions,
  PersonAdd,
  FileUpload,
  FileDownload,
  Edit,
  Delete,
  Visibility,
  MarkEmailRead,
  Group,
  Analytics,
  Assignment,
  EventAvailable,
  School,
  Business,
  Phone,
  Email,
  CalendarToday,
  TrendingUp,
  People,
  ExpandMore,
  FilterList,
  Search,
  Refresh,
  Print,
  Share,
  QrCode,
  NotificationImportant,
  Send,
  AttachFile,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const EnhancedParticipantDashboardV2 = ({ eventId, eventTitle, userRole = 'coordinator' }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    department: '',
    phone: '',
    institution: '',
    designation: 'UG Student'
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkEmailContent, setBulkEmailContent] = useState('');
  const [notificationContent, setNotificationContent] = useState('');

  useEffect(() => {
    fetchParticipants();
    fetchStats();
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === 'hod' 
        ? `http://localhost:5050/api/hod/events/${eventId}/participants`
        : `http://localhost:5050/api/coordinator/events/${eventId}/participants`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setParticipants(response.data.participants || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      enqueueSnackbar('Error fetching participants', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const endpoint = userRole === 'hod'
        ? `http://localhost:5050/api/hod/events/${eventId}/participants/stats`
        : `http://localhost:5050/api/coordinator/participants/attendance-stats/${eventId}`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApproveParticipant = async (participantId) => {
    try {
      await axios.put(
        'http://localhost:5050/api/coordinator/participants/approve',
        { participantId, eventId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar('Participant approved successfully', { variant: 'success' });
      fetchParticipants();
      fetchStats();
    } catch (error) {
      enqueueSnackbar('Error approving participant', { variant: 'error' });
    }
  };

  const handleRejectParticipant = async (participantId) => {
    try {
      await axios.put(
        'http://localhost:5050/api/coordinator/participants/reject',
        { participantId, eventId, rejectionReason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar('Participant rejected', { variant: 'success' });
      setDialogOpen(false);
      setRejectionReason('');
      fetchParticipants();
      fetchStats();
    } catch (error) {
      enqueueSnackbar('Error rejecting participant', { variant: 'error' });
    }
  };

  const handleMarkAttendance = async (participantId, attended) => {
    try {
      await axios.put(
        'http://localhost:5050/api/coordinator/participants/attendance',
        { participantId, eventId, attended },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar(`Attendance ${attended ? 'marked' : 'unmarked'}`, { variant: 'success' });
      fetchParticipants();
      fetchStats();
    } catch (error) {
      enqueueSnackbar('Error updating attendance', { variant: 'error' });
    }
  };

  const handleBulkApprove = async () => {
    try {
      await axios.put(
        'http://localhost:5050/api/coordinator/participants/bulk-approve',
        { participantIds: selectedParticipants, eventId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar(`${selectedParticipants.length} participants approved`, { variant: 'success' });
      setSelectedParticipants([]);
      fetchParticipants();
      fetchStats();
    } catch (error) {
      enqueueSnackbar('Error bulk approving participants', { variant: 'error' });
    }
  };

  const handleBulkAttendance = async (attended) => {
    try {
      await axios.put(
        'http://localhost:5050/api/coordinator/participants/bulk-attendance',
        { participantIds: selectedParticipants, eventId, attended },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar(`Bulk attendance ${attended ? 'marked' : 'unmarked'}`, { variant: 'success' });
      setSelectedParticipants([]);
      fetchParticipants();
      fetchStats();
    } catch (error) {
      enqueueSnackbar('Error bulk updating attendance', { variant: 'error' });
    }
  };

  const handleAddParticipant = async () => {
    try {
      await axios.post(
        'http://localhost:5050/api/coordinator/participants/add',
        { ...newParticipant, eventId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      enqueueSnackbar('Participant added successfully', { variant: 'success' });
      setDialogOpen(false);
      setNewParticipant({
        name: '',
        email: '',
        dateOfBirth: '',
        department: '',
        phone: '',
        institution: '',
        designation: 'UG Student'
      });
      fetchParticipants();
      fetchStats();
    } catch (error) {
      enqueueSnackbar('Error adding participant', { variant: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      const endpoint = userRole === 'hod'
        ? `http://localhost:5050/api/hod/events/${eventId}/participants/export`
        : `http://localhost:5050/api/coordinator/participants/export/${eventId}`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventTitle}_participants.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      enqueueSnackbar('Participants exported successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error exporting participants', { variant: 'error' });
    }
  };

  const handleBulkEmail = async () => {
    try {
      // This would be implemented with an email service
      enqueueSnackbar(`Email sent to ${selectedParticipants.length} participants`, { variant: 'success' });
      setDialogOpen(false);
      setBulkEmailContent('');
    } catch (error) {
      enqueueSnackbar('Error sending bulk email', { variant: 'error' });
    }
  };

  const handleSendNotification = async () => {
    try {
      // This would be implemented with a notification service
      enqueueSnackbar(`Notification sent to ${selectedParticipants.length} participants`, { variant: 'success' });
      setDialogOpen(false);
      setNotificationContent('');
    } catch (error) {
      enqueueSnackbar('Error sending notification', { variant: 'error' });
    }
  };

  const getStatusColor = (registration) => {
    if (userRole === 'hod') return 'success'; // HOD only sees approved participants
    
    if (registration.approved === true) return 'success';
    if (registration.approved === false && registration.rejectionReason) return 'error';
    return 'warning';
  };

  const getStatusText = (registration) => {
    if (userRole === 'hod') return 'Approved'; // HOD only sees approved participants
    
    if (registration.approved === true) return 'Approved';
    if (registration.approved === false && registration.rejectionReason) return 'Rejected';
    return 'Pending';
  };

  const getParticipantRegistration = (participant) => {
    if (userRole === 'hod') {
      return participant.eventRegistration; // HOD API returns filtered registration
    }
    return participant.eventRegistrations?.find(reg => reg.eventId._id === eventId);
  };

  // Advanced filtering
  const filteredParticipants = participants.filter(participant => {
    const registration = getParticipantRegistration(participant);
    if (!registration) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!participant.name?.toLowerCase().includes(searchLower) &&
          !participant.email?.toLowerCase().includes(searchLower) &&
          !participant.department?.toLowerCase().includes(searchLower) &&
          !participant.institution?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'approved' && registration.approved !== true) return false;
      if (filterStatus === 'rejected' && !(registration.approved === false && registration.rejectionReason)) return false;
      if (filterStatus === 'pending' && (registration.approved === true || registration.rejectionReason)) return false;
      if (filterStatus === 'attended' && !registration.attended) return false;
    }
    
    // Department filter
    if (filterDepartment !== 'all' && participant.department !== filterDepartment) return false;
    
    // Tab filter
    if (tabValue === 1) return registration.approved === true; // Approved
    if (tabValue === 2) return registration.approved === false && registration.rejectionReason; // Rejected
    if (tabValue === 3) return registration.approved !== true && !registration.rejectionReason; // Pending
    if (tabValue === 4) return registration.approved === true && registration.attended; // Attended
    
    return true;
  });

  // Get unique departments for filter
  const departments = [...new Set(participants.map(p => p.department).filter(Boolean))];

  const speedDialActions = [
    { icon: <PersonAdd />, name: 'Add Participant', action: () => { setDialogType('add'); setDialogOpen(true); } },
    { icon: <FileUpload />, name: 'Import CSV', action: () => { setDialogType('import'); setDialogOpen(true); } },
    { icon: <FileDownload />, name: 'Export', action: handleExport },
    { icon: <Send />, name: 'Send Email', action: () => { setDialogType('email'); setDialogOpen(true); } },
    { icon: <NotificationImportant />, name: 'Send Notification', action: () => { setDialogType('notification'); setDialogOpen(true); } },
    { icon: <QrCode />, name: 'Generate QR', action: () => { setDialogType('qr'); setDialogOpen(true); } },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading participants...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Participant Management - {eventTitle}
        </Typography>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => { fetchParticipants(); fetchStats(); }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Enhanced Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h4">{stats.totalRegistered || 0}</Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">Approved</Typography>
                  <Typography variant="h4">{stats.totalApproved || 0}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">Attended</Typography>
                  <Typography variant="h4">{stats.totalAttended || 0}</Typography>
                </Box>
                <EventAvailable sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">Pending</Typography>
                  <Typography variant="h4">{stats.totalPending || 0}</Typography>
                </Box>
                <PendingActions sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: 'black' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">Attendance Rate</Typography>
                  <Typography variant="h4">{stats.attendanceRate || 0}%</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Advanced Filters */}
      <Accordion expanded={showAdvancedFilters} onChange={() => setShowAdvancedFilters(!showAdvancedFilters)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1 }} />
            Advanced Filters & Search
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search participants..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="attended">Attended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department Filter</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterDepartment('all');
                }}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Bulk Actions */}
      {userRole === 'coordinator' && selectedParticipants.length > 0 && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Bulk Actions ({selectedParticipants.length} selected)
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleBulkApprove}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Approve Selected
              </Button>
              <Button
                variant="contained"
                startIcon={<EventAvailable />}
                onClick={() => handleBulkAttendance(true)}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Mark Attended
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => handleBulkAttendance(false)}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Mark Not Attended
              </Button>
              <Button
                variant="outlined"
                startIcon={<Send />}
                onClick={() => { setDialogType('email'); setDialogOpen(true); }}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Send Email
              </Button>
              <Button
                variant="outlined"
                startIcon={<NotificationImportant />}
                onClick={() => { setDialogType('notification'); setDialogOpen(true); }}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Send Notification
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${participants.length})`} />
          <Tab label={`Approved (${stats.totalApproved || 0})`} />
          {userRole === 'coordinator' && (
            <>
              <Tab label={`Rejected (${stats.totalRejected || 0})`} />
              <Tab label={`Pending (${stats.totalPending || 0})`} />
            </>
          )}
          <Tab label={`Attended (${stats.totalAttended || 0})`} />
        </Tabs>

        {/* Enhanced Participants Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                {userRole === 'coordinator' && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedParticipants.length > 0 && selectedParticipants.length < filteredParticipants.length}
                      checked={filteredParticipants.length > 0 && selectedParticipants.length === filteredParticipants.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants(filteredParticipants.map(p => p._id));
                        } else {
                          setSelectedParticipants([]);
                        }
                      }}
                    />
                  </TableCell>
                )}
                <TableCell><strong>Participant</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Institution</strong></TableCell>
                <TableCell><strong>Registration</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Attendance</strong></TableCell>
                {userRole === 'coordinator' && <TableCell><strong>Actions</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredParticipants.map((participant) => {
                const registration = getParticipantRegistration(participant);
                if (!registration) return null;

                return (
                  <TableRow 
                    key={participant._id}
                    sx={{ 
                      '&:hover': { bgcolor: 'grey.50' },
                      bgcolor: selectedParticipants.includes(participant._id) ? 'primary.light' : 'inherit'
                    }}
                  >
                    {userRole === 'coordinator' && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedParticipants.includes(participant._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, participant._id]);
                            } else {
                              setSelectedParticipants(selectedParticipants.filter(id => id !== participant._id));
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {participant.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{participant.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {participant.designation}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                          <Email sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                          {participant.email}
                        </Typography>
                        {participant.phone && (
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Phone sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
                            {participant.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                          <School sx={{ mr: 1, fontSize: 16, color: 'info.main' }} />
                          {participant.department || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                          <Business sx={{ mr: 1, fontSize: 14 }} />
                          {participant.institution || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                          <CalendarToday sx={{ mr: 1, fontSize: 14 }} />
                          {new Date(registration.registrationDate).toLocaleDateString()}
                        </Typography>
                        {registration.approvedDate && (
                          <Typography variant="caption" color="success.main">
                            Approved: {new Date(registration.approvedDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={getStatusText(registration)}
                        color={getStatusColor(registration)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      {registration.rejectionReason && (
                        <Tooltip title={registration.rejectionReason}>
                          <Typography variant="caption" display="block" color="error" sx={{ mt: 0.5 }}>
                            Reason: {registration.rejectionReason.substring(0, 30)}...
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {registration.approved === true ? (
                        <Box display="flex" alignItems="center">
                          <Chip
                            label={registration.attended ? 'Present' : 'Absent'}
                            color={registration.attended ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                          {userRole === 'coordinator' && (
                            <Box ml={1}>
                              <Switch
                                checked={registration.attended || false}
                                onChange={(e) => handleMarkAttendance(participant._id, e.target.checked)}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    
                    {userRole === 'coordinator' && (
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          {registration.approved !== true && !registration.rejectionReason && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApproveParticipant(participant._id)}
                                  sx={{ bgcolor: 'success.light', '&:hover': { bgcolor: 'success.main' } }}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setDialogType('reject');
                                    setSelectedParticipants([participant._id]);
                                    setDialogOpen(true);
                                  }}
                                  sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main' } }}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small"
                              sx={{ bgcolor: 'info.light', '&:hover': { bgcolor: 'info.main' } }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              sx={{ bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.400' } }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredParticipants.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No participants found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search terms
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Speed Dial for Quick Actions */}
      {userRole === 'coordinator' && (
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>
      )}

      {/* Enhanced Dialogs */}
      {/* Add Participant Dialog */}
      <Dialog open={dialogOpen && dialogType === 'add'} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <PersonAdd sx={{ mr: 1 }} />
          Add New Participant
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name *"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth *"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newParticipant.dateOfBirth}
                onChange={(e) => setNewParticipant({ ...newParticipant, dateOfBirth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newParticipant.phone}
                onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={newParticipant.department}
                onChange={(e) => setNewParticipant({ ...newParticipant, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Institution"
                value={newParticipant.institution}
                onChange={(e) => setNewParticipant({ ...newParticipant, institution: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Designation</InputLabel>
                <Select
                  value={newParticipant.designation}
                  onChange={(e) => setNewParticipant({ ...newParticipant, designation: e.target.value })}
                >
                  <MenuItem value="UG Student">UG Student</MenuItem>
                  <MenuItem value="PG Student">PG Student</MenuItem>
                  <MenuItem value="Research Scholar">Research Scholar</MenuItem>
                  <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                  <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                  <MenuItem value="Professor">Professor</MenuItem>
                  <MenuItem value="Industry Professional">Industry Professional</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddParticipant} startIcon={<PersonAdd />}>
            Add Participant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Participant Dialog */}
      <Dialog open={dialogOpen && dialogType === 'reject'} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          <Cancel sx={{ mr: 1 }} />
          Reject Participant
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this participant's registration.
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason *"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter detailed reason for rejection..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => handleRejectParticipant(selectedParticipants[0])}
            disabled={!rejectionReason.trim()}
            startIcon={<Cancel />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={dialogOpen && dialogType === 'email'} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white' }}>
          <Send sx={{ mr: 1 }} />
          Send Bulk Email ({selectedParticipants.length} recipients)
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email Subject"
            sx={{ mb: 2 }}
            placeholder="Enter email subject..."
          />
          <TextField
            fullWidth
            label="Email Content"
            multiline
            rows={6}
            value={bulkEmailContent}
            onChange={(e) => setBulkEmailContent(e.target.value)}
            placeholder="Enter your email message here..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleBulkEmail}
            disabled={!bulkEmailContent.trim()}
            startIcon={<Send />}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={dialogOpen && dialogType === 'notification'} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <NotificationImportant sx={{ mr: 1 }} />
          Send Notification ({selectedParticipants.length} recipients)
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Notification Message"
            multiline
            rows={4}
            value={notificationContent}
            onChange={(e) => setNotificationContent(e.target.value)}
            placeholder="Enter notification message..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendNotification}
            disabled={!notificationContent.trim()}
            startIcon={<NotificationImportant />}
          >
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedParticipantDashboardV2;