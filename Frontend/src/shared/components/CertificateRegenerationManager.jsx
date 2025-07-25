import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Refresh,
  Warning,
  CheckCircle,
  Error,
  Info,
  Close,
  Download,
  Event,
  Person,
  Schedule,
  Settings
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const API_BASE_URL = 'http://10.5.12.1:4000/api';

const CertificateRegenerationManager = ({ userRole = 'admin' }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [regenerationDialog, setRegenerationDialog] = useState(false);
  const [regenerationType, setRegenerationType] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedCertificateId, setSelectedCertificateId] = useState('');
  const [events, setEvents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [regenerationProgress, setRegenerationProgress] = useState(null);
  const [regenerationResults, setRegenerationResults] = useState(null);
  const [formats, setFormats] = useState(['pdf', 'image']);
  const [batchSize, setBatchSize] = useState(10);

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/certificates/buffer-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching certificate stats:', error);
      enqueueSnackbar('Failed to load certificate statistics', { variant: 'error' });
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = userRole === 'hod' ? 'hod/allEvents' : 'coordinator/events';
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success || Array.isArray(response.data)) {
        setEvents(response.data.success ? response.data.data : response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCertificatesForEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/certificates/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCertificates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      enqueueSnackbar('Failed to load certificates for event', { variant: 'error' });
    }
  };

  const handleRegenerateAll = async () => {
    try {
      setLoading(true);
      setRegenerationProgress({ current: 0, total: 0, status: 'Starting...' });
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/certificates/regenerate-all`, {
        formats,
        batchSize
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRegenerationResults(response.data.data);
        enqueueSnackbar(
          `Successfully regenerated ${response.data.data.processed} certificates!`, 
          { variant: 'success' }
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error regenerating all certificates:', error);
      enqueueSnackbar('Failed to regenerate certificates', { variant: 'error' });
    } finally {
      setLoading(false);
      setRegenerationProgress(null);
      setRegenerationDialog(false);
    }
  };

  const handleRegenerateByEvent = async () => {
    if (!selectedEventId) {
      enqueueSnackbar('Please select an event', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      setRegenerationProgress({ current: 0, total: 0, status: 'Starting...' });
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/certificates/regenerate-event/${selectedEventId}`, {
        formats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRegenerationResults(response.data.data);
        enqueueSnackbar(
          `Successfully regenerated ${response.data.data.processed} certificates for the event!`, 
          { variant: 'success' }
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error regenerating event certificates:', error);
      enqueueSnackbar('Failed to regenerate event certificates', { variant: 'error' });
    } finally {
      setLoading(false);
      setRegenerationProgress(null);
      setRegenerationDialog(false);
    }
  };

  const handleForceRegenerate = async () => {
    if (!selectedCertificateId) {
      enqueueSnackbar('Please enter a certificate ID', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/certificates/force-regenerate/${selectedCertificateId}`, {
        formats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        enqueueSnackbar('Certificate regenerated successfully!', { variant: 'success' });
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error force regenerating certificate:', error);
      enqueueSnackbar('Failed to regenerate certificate', { variant: 'error' });
    } finally {
      setLoading(false);
      setRegenerationDialog(false);
    }
  };

  const handleRegenerate = () => {
    switch (regenerationType) {
      case 'all':
        handleRegenerateAll();
        break;
      case 'event':
        handleRegenerateByEvent();
        break;
      case 'single':
        handleForceRegenerate();
        break;
      default:
        enqueueSnackbar('Invalid regeneration type', { variant: 'error' });
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const RegenerationDialog = () => (
    <Dialog open={regenerationDialog} onClose={() => setRegenerationDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Regenerate Certificates with Updated HOD Information</Typography>
          <IconButton onClick={() => setRegenerationDialog(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>This will regenerate certificates with the latest HOD information and signature.</strong>
            <br />• Old certificates will be updated with current HOD name and signature
            <br />• This process may take some time for large numbers of certificates
            <br />• Existing download links will continue to work
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Regeneration Type</InputLabel>
              <Select
                value={regenerationType}
                onChange={(e) => setRegenerationType(e.target.value)}
                label="Regeneration Type"
              >
                <MenuItem value="all">All Certificates</MenuItem>
                <MenuItem value="event">Certificates by Event</MenuItem>
                <MenuItem value="single">Single Certificate</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {regenerationType === 'event' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Event</InputLabel>
                <Select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    if (e.target.value) {
                      fetchCertificatesForEvent(e.target.value);
                    }
                  }}
                  label="Select Event"
                >
                  {events.map((event) => (
                    <MenuItem key={event._id} value={event._id}>
                      {event.title} ({new Date(event.startDate).toLocaleDateString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {certificates.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This event has {certificates.length} certificate(s) that will be regenerated.
                </Alert>
              )}
            </Grid>
          )}

          {regenerationType === 'single' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Certificate ID</InputLabel>
                <input
                  type="text"
                  value={selectedCertificateId}
                  onChange={(e) => setSelectedCertificateId(e.target.value)}
                  placeholder="Enter certificate ID (e.g., CERT-2024-001)"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Output Formats:
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formats.includes('pdf')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormats([...formats, 'pdf']);
                    } else {
                      setFormats(formats.filter(f => f !== 'pdf'));
                    }
                  }}
                />
              }
              label="PDF"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formats.includes('image')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormats([...formats, 'image']);
                    } else {
                      setFormats(formats.filter(f => f !== 'image'));
                    }
                  }}
                />
              }
              label="Image (PNG)"
            />
          </Grid>

          {regenerationType === 'all' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Batch Size</InputLabel>
                <Select
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  label="Batch Size"
                >
                  <MenuItem value={5}>5 (Slower, safer)</MenuItem>
                  <MenuItem value={10}>10 (Recommended)</MenuItem>
                  <MenuItem value={20}>20 (Faster, more load)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        {regenerationProgress && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              {regenerationProgress.status}
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setRegenerationDialog(false)} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleRegenerate}
          disabled={loading || formats.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
        >
          {loading ? 'Regenerating...' : 'Start Regeneration'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ResultsDialog = () => (
    <Dialog 
      open={!!regenerationResults} 
      onClose={() => setRegenerationResults(null)} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Regeneration Results</Typography>
          <IconButton onClick={() => setRegenerationResults(null)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {regenerationResults && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {regenerationResults.totalCertificates || regenerationResults.processed}
                  </Typography>
                  <Typography variant="caption">Total</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {regenerationResults.processed}
                  </Typography>
                  <Typography variant="caption">Success</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {regenerationResults.errors}
                  </Typography>
                  <Typography variant="caption">Errors</Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {regenerationResults.successRate || '100%'}
                  </Typography>
                  <Typography variant="caption">Success Rate</Typography>
                </Paper>
              </Grid>
            </Grid>

            {regenerationResults.errors > 0 && regenerationResults.errors && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Errors ({regenerationResults.errors.length}):
                </Typography>
                <List dense>
                  {regenerationResults.errors.slice(0, 5).map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={error.certificateId}
                        secondary={error.error}
                      />
                    </ListItem>
                  ))}
                  {regenerationResults.errors.length > 5 && (
                    <ListItem>
                      <ListItemText 
                        primary={`... and ${regenerationResults.errors.length - 5} more errors`}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setRegenerationResults(null)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Certificate Regeneration Manager
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Regenerate existing certificates with updated HOD information and signatures. 
        This is useful when HOD details change or signatures are updated.
      </Typography>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary">
                  {stats.totalCertificates}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Certificates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {stats.certificatesWithPdf}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With PDF ({stats.storageEfficiency.pdfCoverage})
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="info.main">
                  {stats.certificatesWithImage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Image ({stats.storageEfficiency.imageCoverage})
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {formatBytes(stats.totalStorageUsed)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Storage Used
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Refresh color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Regenerate All Certificates</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Regenerate all existing certificates with the latest HOD information and signature. 
                This will update all certificates in the system.
              </Typography>
              <Chip 
                label={`${stats?.totalCertificates || 0} certificates`} 
                color="primary" 
                size="small" 
              />
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                startIcon={<Refresh />}
                onClick={() => {
                  setRegenerationType('all');
                  setRegenerationDialog(true);
                }}
                disabled={!stats || stats.totalCertificates === 0}
              >
                Regenerate All
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Event color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Regenerate by Event</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Regenerate certificates for a specific event. This is useful when you want to 
                update certificates for a particular event only.
              </Typography>
              <Chip 
                label={`${events.length} events available`} 
                color="secondary" 
                size="small" 
              />
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                startIcon={<Event />}
                onClick={() => {
                  setRegenerationType('event');
                  setRegenerationDialog(true);
                }}
                disabled={events.length === 0}
              >
                Select Event
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Force Regenerate Single</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Force regenerate a specific certificate by ID. This clears the existing 
                certificate data and generates a fresh copy.
              </Typography>
              <Chip 
                label="Individual certificate" 
                color="warning" 
                size="small" 
              />
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                startIcon={<Person />}
                onClick={() => {
                  setRegenerationType('single');
                  setRegenerationDialog(true);
                }}
              >
                Enter Certificate ID
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Important Notes */}
      <Alert severity="warning" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Important Notes:</strong>
          <br />• Regeneration will update certificates with the current HOD information from the database
          <br />• Make sure the HOD has uploaded and activated their signature before regenerating
          <br />• Large regeneration operations may take several minutes to complete
          <br />• Existing download links will continue to work after regeneration
        </Typography>
      </Alert>

      <RegenerationDialog />
      <ResultsDialog />
    </Box>
  );
};

export default CertificateRegenerationManager;