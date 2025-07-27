import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Rating,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  EmojiEvents as CertificateIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const designationOptions = [
  'UG Student',
  'PG Student',
  'Research Scholar',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Industry Professional',
  'Other',
];

const feedbackQuestions = [
  {
    id: 'q7',
    question: 'How effectively do you think the organization of this training programme facilitated a conducive learning environment and promoted active participation among participants?',
    type: 'rating',
    required: true
  },
  {
    id: 'q8',
    question: 'How effectively did the resource persons communicate and engage with the participants to enhance their learning experience?',
    type: 'rating',
    required: true
  },
  {
    id: 'q9',
    question: 'How well do you think the topics covered align with the current trends and challenges, and to what extent did they contribute to your professional development?',
    type: 'rating',
    required: true
  },
  {
    id: 'q10',
    question: 'How effective was the presentation style in conveying the key concepts and fostering a dynamic learning environment for the participants?',
    type: 'rating',
    required: true
  },
  {
    id: 'q11',
    question: 'Please provide an overall assessment of the program\'s overall effectiveness',
    type: 'rating',
    required: true
  },
  {
    id: 'q12',
    question: 'How do you think the training programme could have been more effective? (In 2 lines)',
    type: 'text',
    multiline: true,
    rows: 2,
    required: true
  },
  {
    id: 'q13',
    question: 'How satisfied were you overall?',
    type: 'rating',
    required: true
  },
  {
    id: 'q14',
    question: 'Would you recommend the workshop to your colleagues or peers?',
    type: 'radio',
    options: ['Yes', 'No'],
    required: true
  },
  {
    id: 'q15',
    question: 'Which topics or aspects of the sessions did you find most interesting or useful?',
    type: 'text',
    multiline: true,
    rows: 3,
    required: true
  }
];

const EnhancedFeedbackPortal = ({ onDataChange }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [certificateDialog, setCertificateDialog] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);

  const [personalInfo, setPersonalInfo] = useState({
    email: '',
    name: '',
    designation: '',
    institute: '',
    contact: ''
  });

  const [feedbackData, setFeedbackData] = useState({
    q7: 0, q8: 0, q9: 0, q10: 0, q11: 0,
    q12: '', q13: 0, q14: '', q15: ''
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
  const participantId = userInfo._id;

  // Fetch attended events that need feedback
  const fetchAttendedEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/my-events/${participantId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const events = await response.json();
        // Filter events where participant attended but hasn't given feedback
        const eligibleEvents = events.filter(event => 
          event.attended === true && event.feedbackGiven !== true
        );
        setAttendedEvents(eligibleEvents);
      }
    } catch (error) {
      console.error('Error fetching attended events:', error);
      enqueueSnackbar('Error fetching events', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (participantId) {
      fetchAttendedEvents();
    }
  }, [participantId]);

  // Handle event selection
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setActiveStep(1);
    
    // Pre-fill personal info if available
    setPersonalInfo({
      email: userInfo.email || '',
      name: userInfo.name || '',
      designation: userInfo.designation || '',
      institute: userInfo.institution || '',
      contact: userInfo.phone || ''
    });
  };

  // Handle personal info change
  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // Handle feedback data change
  const handleFeedbackChange = (field, value) => {
    setFeedbackData(prev => ({ ...prev, [field]: value }));
  };

  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 0:
        return selectedEvent !== null;
      case 1:
        return personalInfo.email && personalInfo.name && personalInfo.designation && 
               personalInfo.institute && personalInfo.contact;
      case 2:
        return feedbackQuestions.every(q => {
          if (!q.required) return true;
          const value = feedbackData[q.id];
          if (q.type === 'rating') return value > 0;
          if (q.type === 'text') return value.trim().length > 0;
          if (q.type === 'radio') return value.length > 0;
          return true;
        });
      default:
        return true;
    }
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const payload = {
        participantId,
        eventId: selectedEvent.eventId._id,
        ...personalInfo,
        ...feedbackData
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        enqueueSnackbar('Feedback submitted successfully!', { variant: 'success' });
        
        // Check if certificate was generated
        if (result.certificate) {
          setGeneratedCertificate(result.certificate);
          setCertificateDialog(true);
        }
        
        setActiveStep(3);
        onDataChange?.();
        fetchAttendedEvents();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Error submitting feedback', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Download certificate
  const handleDownloadCertificate = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/participant/download-certificate/${generatedCertificate.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${selectedEvent.eventId.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      enqueueSnackbar('Error downloading certificate', { variant: 'error' });
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedEvent(null);
    setActiveStep(0);
    setPersonalInfo({
      email: '', name: '', designation: '', institute: '', contact: ''
    });
    setFeedbackData({
      q7: 0, q8: 0, q9: 0, q10: 0, q11: 0,
      q12: '', q13: 0, q14: '', q15: ''
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Loading your attended events...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <FeedbackIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Enhanced Feedback Portal
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Submit feedback for attended events and earn your certificates
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {attendedEvents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'grey.300', width: 80, height: 80 }}>
              <EventIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              No Events Available for Feedback
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              You need to attend events before you can submit feedback and earn certificates.
            </Typography>
            <Button variant="outlined" startIcon={<EventIcon />}>
              Browse Available Events
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Progress Stepper */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feedback Process
                </Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                  <Step>
                    <StepLabel>Select Event</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        Choose an event you attended
                      </Typography>
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel>Personal Information</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        Verify your details
                      </Typography>
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel>Submit Feedback</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        Rate and review the event
                      </Typography>
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel>Get Certificate</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        Download your certificate
                      </Typography>
                    </StepContent>
                  </Step>
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Fade in={true} timeout={500}>
              <Card>
                <CardContent>
                  {/* Step 0: Event Selection */}
                  {activeStep === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Select an Event for Feedback
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Choose from the events you have attended to submit feedback and earn your certificate.
                      </Typography>

                      <Grid container spacing={2}>
                        {attendedEvents.map((event) => (
                          <Grid item xs={12} key={event._id}>
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 4
                                }
                              }}
                              onClick={() => handleEventSelect(event)}
                            >
                              <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <EventIcon />
                                  </Avatar>
                                  <Box flexGrow={1}>
                                    <Typography variant="h6">
                                      {event.eventId?.title || 'Event Title'}
                                    </Typography>
                                    <Typography color="text.secondary">
                                      {event.eventId?.description || 'Event Description'}
                                    </Typography>
                                    <Box display="flex" gap={2} mt={1}>
                                      <Chip 
                                        icon={<CalendarIcon />} 
                                        label={new Date(event.eventId?.startDate).toLocaleDateString()}
                                        size="small"
                                      />
                                      <Chip 
                                        icon={<CheckCircleIcon />} 
                                        label="Attended" 
                                        color="success"
                                        size="small"
                                      />
                                      <Chip 
                                        icon={<FeedbackIcon />} 
                                        label="Feedback Pending" 
                                        color="warning"
                                        size="small"
                                      />
                                    </Box>
                                  </Box>
                                  <Button variant="contained" size="small">
                                    Select
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Step 1: Personal Information */}
                  {activeStep === 1 && selectedEvent && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Personal Information
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Please verify and complete your personal information for the certificate.
                      </Typography>

                      {/* Selected Event Info */}
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2">
                          Selected Event: {selectedEvent.eventId?.title}
                        </Typography>
                      </Alert>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            value={personalInfo.email}
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                            required
                            type="email"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Full Name (with Salutation)"
                            value={personalInfo.name}
                            onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                            required
                            placeholder="Dr. John Doe"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Designation"
                            value={personalInfo.designation}
                            onChange={(e) => handlePersonalInfoChange('designation', e.target.value)}
                            required
                          >
                            {designationOptions.map(option => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Contact Number"
                            value={personalInfo.contact}
                            onChange={(e) => handlePersonalInfoChange('contact', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Institution/Organization"
                            value={personalInfo.institute}
                            onChange={(e) => handlePersonalInfoChange('institute', e.target.value)}
                            required
                          />
                        </Grid>
                      </Grid>

                      <Box display="flex" gap={2} mt={3}>
                        <Button onClick={() => setActiveStep(0)}>
                          Back
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={() => setActiveStep(2)}
                          disabled={!validateStep(1)}
                        >
                          Continue to Feedback
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Step 2: Feedback Form */}
                  {activeStep === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Event Feedback
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Please provide your honest feedback about the event. Your responses help us improve future events.
                      </Typography>

                      {feedbackQuestions.map((question, index) => (
                        <Accordion key={question.id} defaultExpanded={index === 0}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {index + 1}
                              </Avatar>
                              <Typography variant="subtitle1">
                                Question {index + 1}
                                {question.required && <span style={{ color: 'red' }}> *</span>}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              {question.question}
                            </Typography>

                            {question.type === 'rating' && (
                              <Box display="flex" alignItems="center" gap={2}>
                                <Rating
                                  value={feedbackData[question.id]}
                                  onChange={(_, value) => handleFeedbackChange(question.id, value)}
                                  size="large"
                                />
                                <Typography variant="body2" color="text.secondary">
                                  ({feedbackData[question.id]}/5)
                                </Typography>
                              </Box>
                            )}

                            {question.type === 'text' && (
                              <TextField
                                fullWidth
                                multiline={question.multiline}
                                rows={question.rows || 1}
                                value={feedbackData[question.id]}
                                onChange={(e) => handleFeedbackChange(question.id, e.target.value)}
                                placeholder="Enter your response..."
                              />
                            )}

                            {question.type === 'radio' && (
                              <RadioGroup
                                row
                                value={feedbackData[question.id]}
                                onChange={(e) => handleFeedbackChange(question.id, e.target.value)}
                              >
                                {question.options.map(option => (
                                  <FormControlLabel
                                    key={option}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                  />
                                ))}
                              </RadioGroup>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      ))}

                      <Box display="flex" gap={2} mt={3}>
                        <Button onClick={() => setActiveStep(1)}>
                          Back
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={handleSubmitFeedback}
                          disabled={!validateStep(2) || submitting}
                          startIcon={submitting ? null : <SendIcon />}
                        >
                          {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Step 3: Success & Certificate */}
                  {activeStep === 3 && (
                    <Zoom in={true} timeout={500}>
                      <Box textAlign="center">
                        <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main', width: 80, height: 80 }}>
                          <CheckCircleIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h5" gutterBottom>
                          Feedback Submitted Successfully!
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                          Thank you for your valuable feedback. Your certificate has been generated and is ready for download.
                        </Typography>

                        {generatedCertificate && (
                          <Card sx={{ mb: 3, bgcolor: 'success.50' }}>
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={2}>
                                <CertificateIcon color="success" sx={{ fontSize: 40 }} />
                                <Box textAlign="left">
                                  <Typography variant="h6">
                                    Certificate Generated
                                  </Typography>
                                  <Typography color="text.secondary">
                                    Certificate ID: {generatedCertificate.certificateId}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        )}

                        <Box display="flex" gap={2} justifyContent="center">
                          <Button 
                            variant="contained" 
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadCertificate}
                            color="success"
                          >
                            Download Certificate
                          </Button>
                          <Button 
                            variant="outlined" 
                            onClick={handleReset}
                          >
                            Submit Another Feedback
                          </Button>
                        </Box>
                      </Box>
                    </Zoom>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      )}

      {/* Certificate Generation Dialog */}
      <Dialog 
        open={certificateDialog} 
        onClose={() => setCertificateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <CertificateIcon color="success" />
            Certificate Generated
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Congratulations! Your certificate has been successfully generated.
          </Typography>
          <Typography color="text.secondary">
            You can download it now or access it later from the "My Certificates" section.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialog(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleDownloadCertificate}
            startIcon={<DownloadIcon />}
          >
            Download Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedFeedbackPortal;