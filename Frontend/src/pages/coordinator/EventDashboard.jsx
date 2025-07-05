import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
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
import { eventState } from "../../context/eventProvider";

const CoordinatorEventDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = eventState();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimData, setClaimData] = useState([]);
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchParticipants();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5050/api/coordinator/programmes/${eventId}`, {
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
      const response = await axios.get(`http://localhost:5050/api/coordinator/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setParticipants(response.data || []);
    } catch (error) {
      console.log("Participants not found or error:", error);
      setParticipants([]);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:5050/api/coordinator/programmes/${eventId}`, {
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
        `http://localhost:5050/api/coordinator/programmes/${eventId}/claim`,
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
            </Typography>
            
            <Grid container spacing={1}>
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
                      {event.objectives}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Expected Outcomes
                    </Typography>
                    <Typography variant="body1">
                      {event.outcomes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Registered Participants ({participants.length})
                </Typography>
                {participants.length > 0 ? (
                  <List>
                    {participants.map((participant, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Avatar>{participant.name?.charAt(0)}</Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={participant.name}
                          secondary={`${participant.email} | ${participant.phone}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">No participants registered yet</Alert>
                )}
              </CardContent>
            </Card>
          )}

          {tabValue === 2 && (
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

              {/* Claim Management */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Claim Management
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
                      Proposal Letter
                    </Typography>
                    <Button variant="outlined" startIcon={<Visibility />}>
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
