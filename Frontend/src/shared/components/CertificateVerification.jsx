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
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  EmojiEvents as CertificateIcon,
  QrCode as QrCodeIcon,
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  const verifyCertificate = async (certId = certificateId) => {
    if (!certId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);
    setVerified(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/verify/${certId.trim()}`);
      
      if (response.data.valid) {
        setCertificate(response.data.certificate);
        setVerified(true);
      } else {
        setVerified(false);
        setError(response.data.message || 'Certificate is invalid or has been revoked');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerified(false);
      setError(
        error.response?.data?.message || 
        'Certificate not found or verification failed'
      );
    } finally {
      setLoading(false);
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
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Certificate ID"
                  placeholder="Enter certificate ID (e.g., CERT-1234567890-ABCDEF123)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  disabled={loading}
                  helperText="Enter the complete certificate ID to verify its authenticity"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || !certificateId.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                >
                  {loading ? 'Verifying...' : 'Verify Certificate'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          icon={<ErrorIcon />}
        >
          <Typography variant="h6" gutterBottom>
            Verification Failed
          </Typography>
          {error}
        </Alert>
      )}

      {/* Verification Result */}
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
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CertificateIcon color="primary" />
                      Certificate Details
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Certificate Information */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="h6" gutterBottom color="primary">
                            Certificate Information
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Certificate ID
                            </Typography>
                            <Typography variant="body1" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                              {certificate.certificateId}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Status
                            </Typography>
                            <Chip 
                              label={certificate.status} 
                              color="success" 
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Issued Date
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(certificate.issuedDate)}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Issued By
                            </Typography>
                            <Typography variant="body1">
                              {certificate.issuedBy?.name || 'Anna University Events Management System'}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Participant and Event Information */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                          <Typography variant="h6" gutterBottom color="primary">
                            Participant & Event Details
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Participant Name
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {certificate.participantName}
                            </Typography>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Event Title
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {certificate.eventTitle}
                            </Typography>
                          </Box>

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
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Skills (if available) */}
                      {certificate.skills && certificate.skills.length > 0 && (
                        <Grid item xs={12}>
                          <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                              Skills & Competencies
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {certificate.skills.map((skill, index) => (
                                <Chip 
                                  key={index} 
                                  label={skill} 
                                  variant="outlined" 
                                  color="primary"
                                />
                              ))}
                            </Box>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>

                    <Divider sx={{ my: 3 }} />

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