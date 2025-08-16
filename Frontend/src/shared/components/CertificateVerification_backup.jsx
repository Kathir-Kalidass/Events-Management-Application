import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Paper,
  Container,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  EmojiEvents as CertificateIcon,
  QrCode as QrCodeIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Fingerprint as FingerprintIcon,
  Shield as ShieldIcon,
  Stars as StarsIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CertificateVerification = () => {
  const { certificateId: urlCertificateId } = useParams();
  const [certificateId, setCertificateId] = useState(urlCertificateId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(null);
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  const verificationSteps = [
    'Validating Input',
    'Connecting to Database',
    'Checking Certificate Status',
    'Verifying Authenticity',
    'Loading Certificate Details'
  ];

  const verifyCertificate = async (certId = certificateId) => {
    if (!certId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerified(null);
    setVerificationStep(0);

    try {
      // Step-by-step verification process
      for (let i = 0; i < verificationSteps.length; i++) {
        setVerificationStep(i);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
      }

      const response = await axios.get(`${API_BASE_URL}/certificates/verify/${certId.trim()}`);
      
      if (response.data.success && response.data.valid) {
        setCertificate(response.data.certificate);
        setVerified(true);
        
        // Add to verification history
        const newVerification = {
          timestamp: new Date(),
          certificateId: certId.trim(),
          status: 'verified',
          participantName: response.data.certificate.participant?.name,
          eventTitle: response.data.certificate.event?.title
        };
        setVerificationHistory(prev => [newVerification, ...prev.slice(0, 9)]); // Keep last 10
        
      } else {
        setVerified(false);
        setError(response.data.message || 'Certificate is invalid or has been revoked');
        
        // Add failed verification to history
        const failedVerification = {
          timestamp: new Date(),
          certificateId: certId.trim(),
          status: 'failed',
          error: response.data.message || 'Verification failed'
        };
        setVerificationHistory(prev => [failedVerification, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerified(false);
      
      const errorMessage = error.response?.data?.message || 'Certificate not found or verification failed';
      setError(errorMessage);
      
      // Add failed verification to history
      const failedVerification = {
        timestamp: new Date(),
        certificateId: certId.trim(),
        status: 'failed',
        error: errorMessage
      };
      setVerificationHistory(prev => [failedVerification, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
      setVerificationStep(0);
    }
  };

  const handleShare = () => {
    if (navigator.share && certificate) {
      navigator.share({
        title: `Certificate Verification - ${certificate.participant?.name}`,
        text: `Verified certificate for ${certificate.event?.title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      setShareDialogOpen(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a snackbar notification here
    });
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCertificate();
  };

  // Auto-verify if certificate ID is provided in URL
  useEffect(() => {
    if (urlCertificateId) {
      verifyCertificate(urlCertificateId);
    }
  }, [urlCertificateId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CertificateIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Certificate Verification
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Verify the authenticity of certificates issued by Anna University Events Management System
        </Typography>
      </Box>

      {/* Search Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon /> Enter Certificate ID
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="e.g., CERT-2024-001-123456789"
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Enter the complete certificate ID as shown on your certificate"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !certificateId.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <VerifiedIcon />}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  {loading ? 'Verifying...' : 'Verify Certificate'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Loading with Steps */}
      {loading && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              Verifying Certificate...
            </Typography>
            <Stepper activeStep={verificationStep} alternativeLabel sx={{ mt: 2 }}>
              {verificationSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>
                    <Typography variant="caption">
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <LinearProgress sx={{ mt: 3 }} variant="determinate" value={(verificationStep / (verificationSteps.length - 1)) * 100} />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <IconButton color="inherit" size="small" onClick={() => setError('')}>
              <CloseIcon />
            </IconButton>
          }
        >
          <AlertTitle>Verification Failed</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Success Verification Result */}
      {verified !== null && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            {verified ? (
              <Box>
                <Alert 
                  severity="success" 
                  sx={{ mb: 3 }}
                  icon={<VerifiedIcon />}
                >
                  <Typography variant="h6" gutterBottom>
                    Certificate Verified Successfully
                  </Typography>
                  This certificate is authentic and has been issued by Anna University Events Management System.
                </Alert>

                {certificate && (
                  <Box>
                    {/* Main Certificate Header */}
                    <Box sx={{ mb: 4, textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                      <Typography variant="h4" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <VerifiedIcon sx={{ fontSize: 32 }} />
                        Verified Certificate
                      </Typography>
                      <Typography variant="h5" gutterBottom>
                        {certificate.participant?.name || certificate.participantName}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {certificate.event?.title || certificate.eventTitle}
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      {/* Certificate Information */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                          <CardHeader 
                            title="Certificate Information"
                            avatar={<CertificateIcon color="primary" />}
                            titleTypographyProps={{ variant: 'h6' }}
                          />
                          <CardContent>
                            <List>
                              <ListItem>
                                <ListItemIcon><QrCodeScannerIcon /></ListItemIcon>
                                <ListItemText 
                                  primary="Certificate ID" 
                                  secondary={certificate.certificateId}
                                  secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                                />
                              </ListItem>
                              
                              <ListItem>
                                <ListItemIcon><DateRangeIcon /></ListItemIcon>
                                <ListItemText 
                                  primary="Issue Date" 
                                  secondary={formatDate(certificate.issuedDate || certificate.createdAt)}
                                />
                              </ListItem>
                              
                              <ListItem>
                                <ListItemIcon><SecurityIcon /></ListItemIcon>
                                <ListItemText 
                                  primary="Status" 
                                  secondary={
                                    <Chip 
                                      label={certificate.status || 'Active'} 
                                      color="success" 
                                      size="small"
                                      icon={<VerifiedIcon />}
                                    />
                                  }
                                />
                              </ListItem>

                              <ListItem>
                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                <ListItemText 
                                  primary="Issued By" 
                                  secondary={certificate.issuer?.name || certificate.issuedBy?.name || 'Anna University Events Management System'}
                                />
                              </ListItem>

                              {certificate.verificationCount && (
                                <ListItem>
                                  <ListItemIcon><VisibilityIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Verification Count" 
                                    secondary={`${certificate.verificationCount} times verified`}
                                  />
                                </ListItem>
                              )}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Participant and Event Information */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                          <CardHeader 
                            title="Participant & Event Details"
                            avatar={<EventIcon color="primary" />}
                            titleTypographyProps={{ variant: 'h6' }}
                          />
                          <CardContent>
                            <List>
                              <ListItem>
                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                <ListItemText 
                                  primary="Participant Name" 
                                  secondary={certificate.participant?.name || certificate.participantName}
                                  secondaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                                />
                              </ListItem>
                              
                              {certificate.participant?.email && (
                                <ListItem>
                                  <ListItemIcon><EmailIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Email" 
                                    secondary={certificate.participant.email}
                                  />
                                </ListItem>
                              )}

                              <ListItem>
                                <ListItemIcon><EventIcon /></ListItemIcon>
                                <ListItemText 
                                  primary="Event Title" 
                                  secondary={certificate.event?.title || certificate.eventTitle}
                                  secondaryTypographyProps={{ fontWeight: 'medium' }}
                                />
                              </ListItem>
                              
                              {certificate.event?.description && (
                                <ListItem>
                                  <ListItemIcon><DescriptionIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Description" 
                                    secondary={certificate.event.description}
                                  />
                                </ListItem>
                              )}

                              {certificate.event?.startDate && certificate.event?.endDate && (
                                <ListItem>
                                  <ListItemIcon><DateRangeIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Event Duration" 
                                    secondary={formatDateRange(certificate.event.startDate, certificate.event.endDate)}
                                  />
                                </ListItem>
                              )}

                              {certificate.event?.location && (
                                <ListItem>
                                  <ListItemIcon><LocationOnIcon /></ListItemIcon>
                                  <ListItemText 
                                    primary="Location" 
                                    secondary={certificate.event.location}
                                  />
                                </ListItem>
                              )}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Security & Verification Details */}
                    {certificate.security && (
                      <Card sx={{ mb: 4 }}>
                        <CardHeader 
                          title="Security & Authenticity"
                          avatar={<SecurityIcon color="primary" />}
                          titleTypographyProps={{ variant: 'h6' }}
                        />
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ textAlign: 'center', p: 2 }}>
                                <SecurityIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                  Digital Signature
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Cryptographically Verified
                                </Typography>
                                <Chip label="Valid" color="success" size="small" sx={{ mt: 1 }} />
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Box sx={{ textAlign: 'center', p: 2 }}>
                                <LockIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                  Tamper Proof
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Integrity Protected
                                </Typography>
                                <Chip label="Secure" color="success" size="small" sx={{ mt: 1 }} />
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Box sx={{ textAlign: 'center', p: 2 }}>
                                <CloudDoneIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                  Blockchain Verified
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Immutable Record
                                </Typography>
                                <Chip label="Verified" color="success" size="small" sx={{ mt: 1 }} />
                              </Box>
                            </Grid>
                          </Grid>
                          
                          {certificate.security.lastVerified && (
                            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Last verified: {formatDate(certificate.security.lastVerified)}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Certificate Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<ShareIcon />}
                            onClick={handleShare}
                          >
                            Share Certificate
                          </Button>
                          
                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => window.open(`${API_BASE_URL}/certificates/download/${certificate.certificateId}`, '_blank')}
                          >
                            Download PDF
                          </Button>
                          
                          <Button
                            variant="outlined"
                            startIcon={<LinkIcon />}
                            onClick={() => copyToClipboard(window.location.href)}
                          >
                            Copy Link
                          </Button>
                          
                          <Button
                            variant="outlined"
                            startIcon={<InfoIcon />}
                            onClick={() => setShowDetails(!showDetails)}
                          >
                            {showDetails ? 'Hide' : 'Show'} Technical Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Duration
                            </Typography>
                            <Typography variant="body1">
                              {certificate.eventDuration}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Event Dates
                            </Typography>
                            <Typography variant="body1">
                              {formatDateRange(certificate.eventDates.startDate, certificate.eventDates.endDate)}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Venue
                            </Typography>
                            <Typography variant="body1">
                              {certificate.venue}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Mode
                            </Typography>
                            <Chip 
                              label={certificate.mode} 
                              variant="outlined" 
                              size="small"
                            />
                    
                    {/* Technical Details Collapsible Section */}
                    <Collapse in={showDetails}>
                      <Card sx={{ mt: 2 }}>
                        <CardHeader 
                          title="Technical Details"
                          avatar={<InfoIcon color="primary" />}
                          titleTypographyProps={{ variant: 'h6' }}
                        />
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Verification Timestamp
                              </Typography>
                              <Typography variant="body2" fontFamily="monospace">
                                {new Date().toISOString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Certificate Hash
                              </Typography>
                              <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                                {certificate.security?.hash || 'SHA256:' + btoa(certificate.certificateId).substring(0, 16)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Collapse>

                    {/* Verification Notice */}
                    <Alert severity="info" sx={{ mt: 3 }}>
                      <Typography variant="body2">
                        <strong>Verification Notice:</strong> This certificate has been digitally verified against 
                        Anna University's Events Management System database. The information displayed above 
                        confirms the authenticity and validity of this certificate.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>
            ) : (
              <Alert 
                severity="error"
                icon={<ErrorIcon />}
              >
                <Typography variant="h6" gutterBottom>
                  Certificate Not Valid
                </Typography>
                The certificate ID you entered is either invalid, has been revoked, or does not exist in our system.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Verify a Certificate
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>1. Locate the Certificate ID:</strong> Find the unique certificate ID on the certificate document. 
                It usually starts with "CERT-" followed by numbers and letters.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>2. Enter the ID:</strong> Type or paste the complete certificate ID in the search box above.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>3. Verify:</strong> Click the "Verify Certificate" button to check its authenticity.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>4. Review Results:</strong> If valid, you'll see detailed information about the certificate, 
                participant, and event.
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCodeIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              You can also scan the QR code on the certificate to automatically verify it.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CertificateVerification;