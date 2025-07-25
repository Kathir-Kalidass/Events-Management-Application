import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Tooltip,
  Collapse,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  CheckCircle,
  PendingActions,
  AttachFile,
  DateRange,
  People,
  MonetizationOn,
  Approval,
  Receipt,
  AccountBalance,
  EventAvailable,
  Download,
  Upload,
  Visibility,
  Analytics,
  Assignment,
  Group,
  Timeline,
  TrendingUp,
  InfoOutlined,
  Cancel,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useSnackbar } from "notistack";
import { eventState } from "../../shared/context/eventProvider";
import { generateEventBrochure } from "../../shared/services/brochureGenerator";
import ClaimManagement from "../../shared/components/ClaimManagement";
import EnhancedParticipantDashboard from "../../shared/components/EnhancedParticipantDashboard";
import FeedbackStatsCard from "../../shared/components/FeedbackStatsCard";
import AddParticipantModal from "../../shared/components/AddParticipantModal";

const CoordinatorEventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = eventState();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimData, setClaimData] = useState([]);
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchParticipants();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/coordinator/programmes/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEvent(response.data);
      
      // Initialize claim data with budget breakdown expenses
      if (response.data.budgetBreakdown?.expenses) {
        setClaimData(response.data.budgetBreakdown.expenses.map(expense => ({
          category: expense.category,
          budgetAmount: expense.amount,
          actualAmount: 0,
        })));
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      enqueueSnackbar("Error fetching event details", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      // Use the correct endpoint for participants
      const response = await axios.get(`http://localhost:4000/api/coordinator/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.data.success) {
        setParticipants(response.data.participants || []);
      } else {
        setParticipants([]);
      }
    } catch (error) {

      if (error.response?.status === 404) {

      }
      setParticipants([]);
    }
  };

  const handleEdit = () => {
    // Navigate to coordinator dashboard with event data for editing
    navigate("/coordinator/dashboard", { 
      state: { 
        editingEvent: event,
        editMode: true 
      } 
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:4000/api/coordinator/programmes/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        enqueueSnackbar("Event deleted successfully", { variant: "success" });
        navigate("/coordinator/dashboard");
      } catch (error) {
        console.error("Error deleting event:", error);
        enqueueSnackbar("Error deleting event", { variant: "error" });
      }
    }
  };

  const handleClaimSubmission = async () => {
    try {
      const totalExpenditure = claimData.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
      
      const claimPayload = {
        expenses: claimData.map(item => ({
          category: item.category,
          amount: item.actualAmount || 0,
        })),
        totalExpenditure,
      };

      await axios.post(
        `http://localhost:4000/api/coordinator/programmes/${eventId}/claim`,
        claimPayload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      enqueueSnackbar("Claim submitted successfully", { variant: "success" });
      setClaimDialogOpen(false);
      fetchEventDetails(); // Refresh event data
    } catch (error) {
      console.error("Error submitting claim:", error);
      enqueueSnackbar("Error submitting claim", { variant: "error" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "error";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const getProgress = () => {
    if (!event) return 0;
    
    let progress = 0;
    let steps = [];
    
    // Step 1: Event Created (15%)
    progress += 15;
    steps.push("Event created");
    
    // Step 2: Basic Details Complete (10%)
    if (event.title && event.startDate && event.endDate && event.venue && 
        event.objectives && event.outcomes && event.targetAudience?.length > 0) {
      progress += 10;
      steps.push("Basic details complete");
    }
    
    // Step 3: Budget Breakdown Complete (15%)
    if (event.budgetBreakdown?.income?.length > 0 && 
        event.budgetBreakdown?.expenses?.length > 0) {
      progress += 15;
      steps.push("Budget breakdown complete");
    }
    
    // Step 4: Coordinators Added (10%)
    if (event.coordinators?.length > 0) {
      progress += 10;
      steps.push("Coordinators assigned");
    }
    
    // Step 5: Brochure Uploaded (15%)
    if (event.brochure) {
      progress += 15;
      steps.push("Brochure uploaded");
    }
    
    // Step 6: Event Approved by HOD (20%)
    if (event.status === "approved") {
      progress += 20;
      steps.push("Approved by HOD");
    } else if (event.status === "rejected") {
      // Don't add progress for rejection
      steps.push("Rejected by HOD");
    }
    
    // Step 7: Event Conducted (10%) - Check if event date has passed
    const eventEndDate = new Date(event.endDate);
    const currentDate = new Date();
    if (eventEndDate < currentDate && event.status === "approved") {
      progress += 10;
      steps.push("Event conducted");
    }
    
    // Step 8: Claim Bill Submitted (5%)
    if (event.claimSubmitted) {
      progress += 5;
      steps.push("Claim bill submitted");
    }
    
    return { progress: Math.min(progress, 100), steps };
  };

  // Generate complete brochure with event details and registration procedure
  const generateCompleteBrochure = () => {
    let brochureText = `${event.title?.toUpperCase() || 'EVENT'}\n`;
    brochureText += `${'='.repeat(event.title?.length || 5)}\n\n`;

    // Event Details
    brochureText += "EVENT DETAILS\n";
    brochureText += "-".repeat(20) + "\n";
    brochureText += `Date: ${new Date(event.startDate).toLocaleDateString()}`;
    if (event.endDate && event.endDate !== event.startDate) {
      brochureText += ` - ${new Date(event.endDate).toLocaleDateString()}`;
    }
    brochureText += `\n`;
    brochureText += `Venue: ${event.venue || 'TBA'}\n`;
    brochureText += `Mode: ${event.mode || 'TBA'}\n`;
    brochureText += `Duration: ${event.duration || 'TBA'}\n`;
    brochureText += `Type: ${event.type || 'TBA'}\n\n`;

    // Objectives
    if (event.objectives) {
      brochureText += "OBJECTIVES\n";
      brochureText += "-".repeat(20) + "\n";
      brochureText += `${event.objectives}\n\n`;
    }

    // Expected Outcomes
    if (event.outcomes) {
      brochureText += "EXPECTED OUTCOMES\n";
      brochureText += "-".repeat(20) + "\n";
      brochureText += `${event.outcomes}\n\n`;
    }

    // Target Audience
    if (event.targetAudience?.length > 0) {
      brochureText += "TARGET AUDIENCE\n";
      brochureText += "-".repeat(20) + "\n";
      event.targetAudience.forEach(audience => {
        brochureText += `• ${audience}\n`;
      });
      brochureText += "\n";
    }

    // Resource Persons
    if (event.resourcePersons?.length > 0) {
      brochureText += "RESOURCE PERSONS\n";
      brochureText += "-".repeat(20) + "\n";
      event.resourcePersons.forEach(person => {
        brochureText += `• ${person}\n`;
      });
      brochureText += "\n";
    }

    // Registration Procedure
    if (event.registrationProcedure && event.registrationProcedure.enabled) {
      brochureText += "REGISTRATION INFORMATION\n";
      brochureText += "-".repeat(30) + "\n";

      if (event.registrationProcedure.instructions) {
        brochureText += `Instructions: ${event.registrationProcedure.instructions}\n\n`;
      }

      if (event.registrationProcedure.registrationDeadline) {
        brochureText += `Registration Deadline: ${new Date(event.registrationProcedure.registrationDeadline).toLocaleDateString()}\n`;
      }

      if (event.registrationProcedure.participantLimit) {
        brochureText += `Participant Limit: ${event.registrationProcedure.participantLimit}\n`;
      }

      if (event.registrationProcedure.selectionCriteria && 
          event.registrationProcedure.selectionCriteria !== 'first come first served basis') {
        brochureText += `Selection Criteria: ${event.registrationProcedure.selectionCriteria}\n`;
      }

      if (event.registrationProcedure.confirmation) {
        brochureText += `Confirmation Process: ${event.registrationProcedure.confirmation}\n`;
      }

      if (event.registrationProcedure.certificateRequirements && event.registrationProcedure.certificateRequirements.enabled) {
        brochureText += `Certificate Requirements: Certificate will be provided based on specified criteria\n`;
      }

      brochureText += "\n";

      // Payment Details
      if (event.registrationProcedure.paymentDetails && event.registrationProcedure.paymentDetails.enabled) {
        brochureText += "PAYMENT DETAILS\n";
        brochureText += "-".repeat(20) + "\n";
        
        if (event.registrationProcedure.paymentDetails.accountName) {
          brochureText += `Account Name: ${event.registrationProcedure.paymentDetails.accountName}\n`;
        }
        if (event.registrationProcedure.paymentDetails.accountNumber) {
          brochureText += `Account Number: ${event.registrationProcedure.paymentDetails.accountNumber}\n`;
        }
        if (event.registrationProcedure.paymentDetails.ifscCode) {
          brochureText += `IFSC Code: ${event.registrationProcedure.paymentDetails.ifscCode}\n`;
        }
        if (event.registrationProcedure.paymentDetails.bankName) {
          brochureText += `Bank Name: ${event.registrationProcedure.paymentDetails.bankName}\n`;
        }
        if (event.registrationProcedure.paymentDetails.upiId) {
          brochureText += `UPI ID: ${event.registrationProcedure.paymentDetails.upiId}\n`;
        }
        if (event.registrationProcedure.paymentDetails.notes) {
          brochureText += `Notes: ${event.registrationProcedure.paymentDetails.notes}\n`;
        }
        brochureText += "\n";
      }

      // Registration Form Template
      if (event.registrationProcedure.registrationForm && event.registrationProcedure.registrationForm.enabled) {
        brochureText += "REGISTRATION FORM FIELDS\n";
        brochureText += "-".repeat(25) + "\n";
        
        if (event.registrationProcedure.registrationForm.fields) {
          Object.entries(event.registrationProcedure.registrationForm.fields).forEach(([fieldKey, fieldValue]) => {
            if (fieldKey === 'category' && fieldValue.enabled) {
              brochureText += `• Category (select, Required)\n`;
            } else if (typeof fieldValue === 'boolean' && fieldValue) {
              brochureText += `• ${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)} (text, Required)\n`;
            }
          });
        }
        
        if (event.registrationProcedure.registrationForm.customFields?.length > 0) {
          event.registrationProcedure.registrationForm.customFields.forEach(field => {
            brochureText += `• ${field.fieldName} (${field.fieldType}${field.required ? ', Required' : ''})\n`;
          });
        }
        
        if (event.registrationProcedure.registrationForm.additionalRequirements) {
          brochureText += `\nAdditional Requirements: ${event.registrationProcedure.registrationForm.additionalRequirements}\n`;
        }
        
        brochureText += "\n";
      }
    }

    // Coordinators
    if (event.coordinators?.length > 0) {
      brochureText += "COORDINATORS\n";
      brochureText += "-".repeat(20) + "\n";
      event.coordinators.forEach(coordinator => {
        brochureText += `${coordinator.name}\n`;
        brochureText += `${coordinator.designation}\n`;
        if (coordinator.department) {
          brochureText += `${coordinator.department}\n`;
        }
        brochureText += "\n";
      });
    }

    return brochureText;
  };

  // Generate brochure using frontend generator (with designs and logo)
  const generateStyledBrochure = async () => {
    try {

      const brochureDoc = await generateEventBrochure(event);
      
      if (brochureDoc) {
        const pdfBlob = brochureDoc.output('blob');
        
        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_brochure_styled.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        enqueueSnackbar("Styled brochure generated successfully!", { variant: "success" });
      }
    } catch (error) {
      console.error("Error generating styled brochure:", error);
      enqueueSnackbar(`Failed to generate styled brochure: ${error.message}`, { variant: "error" });
    }
  };

  const downloadCompleteBrochure = async () => {
    try {

      // Fetch event data with organizing committee from HOD API
      let eventWithOrganizingCommittee;
      try {
        const response = await axios.get(`http://localhost:4000/api/hod/events/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        eventWithOrganizingCommittee = response.data;

      } catch (hodApiError) {
        console.warn("Failed to fetch from HOD API, using coordinator event data:", hodApiError.message);
        eventWithOrganizingCommittee = event;
      }
      
      // Generate the professional styled brochure using frontend jsPDF
      const doc = await generateEventBrochure(eventWithOrganizingCommittee);
      
      // Convert to blob
      const pdfBlob = doc.output('blob');
      
      // Also save a copy to the backend for future access
      try {
        const formData = new FormData();
        formData.append('brochurePDF', pdfBlob, `Brochure_${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}.pdf`);
        
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:4000/api/coordinator/brochures/${event._id}/save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });

      } catch (saveError) {
        console.warn("Failed to save brochure to backend:", saveError.message);
        // Continue with download even if save fails
      }
      
      // Download the styled brochure
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl);
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: trigger download instead
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_brochure.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Professional brochure PDF downloaded successfully!');
      }

      // Clean up the URL after a reasonable time
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 4000);
      
    } catch (error) {
      console.error("Error generating styled brochure:", error.message);
      alert(`Failed to generate brochure: ${error.message}`);
    }
  };

  const viewProposalPDF = async () => {
    try {
      console.log("Opening programme PDF (note order)...");
      
      // Call the backend endpoint to generate the programme PDF
      const response = await fetch(`http://localhost:4000/api/coordinator/programmes/${eventId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate programme PDF: ${response.status} ${response.statusText}`);
      }
      
      // Get the PDF blob from the response
      const pdfBlob = await response.blob();
      
      // Create a URL for the PDF blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Try to open in a new window/tab
      const newWindow = window.open(pdfUrl, '_blank');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: trigger download instead
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `NoteOrder_${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        enqueueSnackbar('Programme PDF downloaded (popup blocked)', { variant: 'info' });
      } else {
        enqueueSnackbar('Programme PDF opened in new tab', { variant: 'success' });
      }

      // Clean up the URL after a reasonable time
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 10000);
      
    } catch (error) {
      console.error("Error opening programme PDF:", error.message);
      enqueueSnackbar(`Failed to open programme PDF: ${error.message}`, { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate("/coordinator/dashboard")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" flexGrow={1}>
          {event.title}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
            disabled={event.status === "approved"}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={event.status === "approved"}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadCompleteBrochure}
          >
            Download Professional Brochure (PDF)
          </Button>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Event Progress
          </Typography>
          <Tooltip title="Click to see progress details">
            <IconButton 
              size="small" 
              onClick={() => setShowProgressDetails(!showProgressDetails)}
            >
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={getProgress().progress} 
          sx={{ height: 10, borderRadius: 5, mb: 1 }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            {getProgress().progress}% Complete
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getProgress().steps.length} of 8 steps completed
          </Typography>
        </Box>
        
        <Collapse in={showProgressDetails}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Progress Breakdown:
            </Typography>              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Completed Steps:
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {getProgress().steps.map((step, index) => (
                      <Chip
                        key={index}
                        label={step}
                        size="small"
                        color={step.includes("Rejected") ? "error" : "success"}
                        variant="filled"
                        icon={step.includes("Rejected") ? <Cancel /> : <CheckCircle />}
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Progress Steps (% each):
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Event created (15%)" 
                      secondary="Basic event information submitted"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Basic details complete (10%)" 
                      secondary="All required fields filled"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Budget breakdown complete (15%)" 
                      secondary="Income and expense categories defined"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Coordinators assigned (10%)" 
                      secondary="Event coordinators added"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Brochure uploaded (15%)" 
                      secondary="Event brochure/document attached"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Approved by HOD (20%)" 
                      secondary="HOD approval received"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Event conducted (10%)" 
                      secondary="Event date has passed"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Claim bill submitted (5%)" 
                      secondary="Final expenses submitted"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Status and Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Approval sx={{ mr: 1, color: getStatusColor(event.status) === "success" ? "green" : getStatusColor(event.status) === "error" ? "red" : "orange" }} />
                <Box>
                  <Typography variant="h6">Status</Typography>
                  <Chip 
                    label={event.status?.toUpperCase() || "PENDING"} 
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ mr: 1, color: "blue" }} />
                <Box>
                  <Typography variant="h6">Participants</Typography>
                  <Typography variant="h4">{participants.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MonetizationOn sx={{ mr: 1, color: "green" }} />
                <Box>
                  <Typography variant="h6">Budget</Typography>
                  <Typography variant="h4">₹{event.budget?.toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt sx={{ mr: 1, color: event.claimSubmitted ? "green" : "gray" }} />
                <Box>
                  <Typography variant="h6">Claim</Typography>
                  <Chip 
                    label={event.claimSubmitted ? "SUBMITTED" : "PENDING"} 
                    color={event.claimSubmitted ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" icon={<EventAvailable />} />
          <Tab label="Participants" icon={<People />} />
          <Tab label="Financials" icon={<MonetizationOn />} />
          <Tab label="Documents" icon={<AttachFile />} />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Event Details */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Event Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Start Date</Typography>
                        <Typography variant="body1">{new Date(event.startDate).toLocaleDateString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">End Date</Typography>
                        <Typography variant="body1">{new Date(event.endDate).toLocaleDateString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Venue</Typography>
                        <Typography variant="body1">{event.venue}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Mode</Typography>
                        <Typography variant="body1">{event.mode}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">{event.duration}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Typography variant="body1">{event.type}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Target Audience</Typography>
                        <Box sx={{ mt: 1 }}>
                          {event.targetAudience?.map((audience, index) => (
                            <Chip key={index} label={audience} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Resource Persons</Typography>
                        <Box sx={{ mt: 1 }}>
                          {event.resourcePersons?.length > 0 ? (
                            event.resourcePersons.map((person, index) => (
                              <Chip key={index} label={person} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">Not specified</Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Coordinators */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Coordinators
                    </Typography>
                    <List dense>
                      {event.coordinators?.map((coordinator, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {coordinator.name?.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={coordinator.name}
                            secondary={coordinator.designation}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Objectives and Outcomes */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Objectives
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {typeof event.objectives === 'string' ? event.objectives : 'No objectives specified'}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Expected Outcomes
                    </Typography>
                    <Typography variant="body1">
                      {typeof event.outcomes === 'string' ? event.outcomes : 'No expected outcomes specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Registration Procedure */}
              {event.registrationProcedure && event.registrationProcedure.enabled && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Registration Information
                      </Typography>
                      
                      {event.registrationProcedure.instructions && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                            Instructions
                          </Typography>
                          <Typography variant="body1" paragraph>
                            {typeof event.registrationProcedure.instructions === 'string' 
                              ? event.registrationProcedure.instructions 
                              : 'No instructions specified'}
                          </Typography>
                        </>
                      )}

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {event.registrationProcedure.registrationDeadline && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Registration Deadline</Typography>
                            <Typography variant="body1">
                              {new Date(event.registrationProcedure.registrationDeadline).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        )}
                        
                        {event.registrationProcedure.participantLimit && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Participant Limit</Typography>
                            <Typography variant="body1">{event.registrationProcedure.participantLimit}</Typography>
                          </Grid>
                        )}

                        {event.registrationProcedure.selectionCriteria && 
                         event.registrationProcedure.selectionCriteria !== 'first come first served basis' && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Selection Criteria</Typography>
                            <Typography variant="body1">
                              {typeof event.registrationProcedure.selectionCriteria === 'string' 
                                ? event.registrationProcedure.selectionCriteria 
                                : 'Not specified'}
                            </Typography>
                          </Grid>
                        )}

                        {event.registrationProcedure.confirmation && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Confirmation Process</Typography>
                            <Typography variant="body1">
                              {typeof event.registrationProcedure.confirmation === 'string' 
                                ? event.registrationProcedure.confirmation 
                                : 'Not specified'}
                            </Typography>
                          </Grid>
                        )}

                        {event.registrationProcedure.certificateRequirements && 
                         event.registrationProcedure.certificateRequirements.enabled && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Certificate Requirements</Typography>
                            <Typography variant="body1">
                              Certificate will be provided based on specified criteria
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      {/* Payment Details */}
                      {event.registrationProcedure.paymentDetails && 
                       event.registrationProcedure.paymentDetails.enabled && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                            Payment Information
                          </Typography>
                          <Grid container spacing={2}>
                            {event.registrationProcedure.paymentDetails.accountName && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Account Name</Typography>
                                <Typography variant="body1">
                                  {typeof event.registrationProcedure.paymentDetails.accountName === 'string' 
                                    ? event.registrationProcedure.paymentDetails.accountName 
                                    : 'Not specified'}
                                </Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.accountNumber && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                                <Typography variant="body1">
                                  {typeof event.registrationProcedure.paymentDetails.accountNumber === 'string' 
                                    ? event.registrationProcedure.paymentDetails.accountNumber 
                                    : 'Not specified'}
                                </Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.ifscCode && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                                <Typography variant="body1">
                                  {typeof event.registrationProcedure.paymentDetails.ifscCode === 'string' 
                                    ? event.registrationProcedure.paymentDetails.ifscCode 
                                    : 'Not specified'}
                                </Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.bankName && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                                <Typography variant="body1">
                                  {typeof event.registrationProcedure.paymentDetails.bankName === 'string' 
                                    ? event.registrationProcedure.paymentDetails.bankName 
                                    : 'Not specified'}
                                </Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.upiId && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">UPI ID</Typography>
                                <Typography variant="body1">
                                  {typeof event.registrationProcedure.paymentDetails.upiId === 'string' 
                                    ? event.registrationProcedure.paymentDetails.upiId 
                                    : 'Not specified'}
                                </Typography>
                              </Grid>
                            )}
                            {event.registrationProcedure.paymentDetails.notes && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Payment Notes</Typography>
                                <Typography variant="body1">
                                  {typeof event.registrationProcedure.paymentDetails.notes === 'string' 
                                    ? event.registrationProcedure.paymentDetails.notes 
                                    : 'Not specified'}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </>
                      )}

                      {/* Registration Form Template */}
                      {event.registrationProcedure.registrationForm && 
                       event.registrationProcedure.registrationForm.enabled && (
                        <>
                          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                            Registration Form Fields
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            {event.registrationProcedure.registrationForm.fields && 
                             Object.entries(event.registrationProcedure.registrationForm.fields).map(([fieldKey, fieldValue]) => {
                              if (fieldKey === 'category' && fieldValue.enabled) {
                                return (
                                  <Chip 
                                    key={fieldKey} 
                                    label={`Category (select, Required)`}
                                    size="small" 
                                    sx={{ mr: 1, mb: 1 }}
                                    variant="outlined"
                                  />
                                );
                              } else if (typeof fieldValue === 'boolean' && fieldValue) {
                                return (
                                  <Chip 
                                    key={fieldKey} 
                                    label={`${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)} (text, Required)`}
                                    size="small" 
                                    sx={{ mr: 1, mb: 1 }}
                                    variant="outlined"
                                  />
                                );
                              }
                              return null;
                            })}
                            {event.registrationProcedure.registrationForm.customFields && 
                             event.registrationProcedure.registrationForm.customFields.length > 0 && 
                             event.registrationProcedure.registrationForm.customFields.map((field, index) => (
                              <Chip 
                                key={`custom-${index}`} 
                                label={`${field.fieldName} (${field.fieldType}${field.required ? ', Required' : ''})`}
                                size="small" 
                                sx={{ mr: 1, mb: 1 }}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Box>
              {/* Feedback Statistics */}
              <Box sx={{ mb: 3 }}>
                <FeedbackStatsCard eventId={eventId} userRole="coordinator" />
              </Box>
              
              {/* Import and use the enhanced participant dashboard */}
              <EnhancedParticipantDashboard 
                eventId={eventId} 
                eventTitle={event.title}
                userRole="coordinator"
              />
            </Box>
          )}

          {tabValue === 2 && (
            <>
              <Grid container spacing={3}>
                {/* Budget Breakdown */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Budget Breakdown
                      </Typography>
                      {event.budgetBreakdown?.income?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Income</Typography>
                          {event.budgetBreakdown.income.map((item, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">{item.category}</Typography>
                              <Typography variant="body2">₹{item.income?.toLocaleString()}</Typography>
                            </Box>
                          ))}
                        </>
                      )}
                      
                      {event.budgetBreakdown?.expenses?.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Expenses</Typography>
                          {event.budgetBreakdown.expenses.map((item, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">{item.category}</Typography>
                              <Typography variant="body2">₹{item.amount?.toLocaleString()}</Typography>
                            </Box>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Quick Claim Submission */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Quick Claim Submission
                      </Typography>
                      {event.claimSubmitted ? (
                        <Alert severity="success">
                          Claim has been submitted for approval
                        </Alert>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<Receipt />}
                          onClick={() => setClaimDialogOpen(true)}
                          disabled={event.status !== "approved"}
                        >
                          Submit Claim Bill
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Claim Management Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                  Claim Management
                </Typography>
                <ClaimManagement eventId={eventId} />
              </Box>
            </>
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Event Brochure
                    </Typography>
                    {event.brochure ? (
                      <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Brochure uploaded successfully
                        </Alert>
                        <Button variant="outlined" startIcon={<Download />}>
                          Download Brochure
                        </Button>
                      </Box>
                    ) : (
                      <Alert severity="warning">
                        No brochure uploaded yet
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Note Order
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<Visibility />}
                      onClick={viewProposalPDF}
                    >
                      View Proposal
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Claim Dialog */}
      <Dialog open={claimDialogOpen} onClose={() => setClaimDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Claim Bill</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the actual amounts spent for each budget category:
          </Typography>
          
          {claimData.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{item.category}</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Budget: ₹{item.budgetAmount?.toLocaleString()}
                </Typography>
                <TextField
                  label="Actual Amount"
                  type="number"
                  value={item.actualAmount || ""}
                  onChange={(e) => {
                    const newClaimData = [...claimData];
                    newClaimData[index].actualAmount = Number(e.target.value);
                    setClaimData(newClaimData);
                  }}
                  size="small"
                  InputProps={{ startAdornment: "₹" }}
                />
              </Box>
            </Box>
          ))}
          
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Total Expenditure: ₹{claimData.reduce((sum, item) => sum + (item.actualAmount || 0), 0).toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleClaimSubmission}>
            Submit Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CoordinatorEventDashboard;
