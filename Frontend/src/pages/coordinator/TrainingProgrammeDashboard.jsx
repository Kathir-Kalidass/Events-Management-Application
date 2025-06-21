import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, Grid, Chip, IconButton, Avatar, Divider, Badge, Paper,
  Stepper, Step, StepLabel, FormControl, InputLabel, FormHelperText,
  CircularProgress, Alert
} from '@mui/material';
import {
  Add, Edit, Delete, CheckCircle, PendingActions,
  AttachFile, DateRange, People, MonetizationOn,
  Approval, Receipt, AccountBalance, EventAvailable
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import {eventState} from '../../context/eventProvider'

const Dashboard = () => {

  const {user} = eventState();
  const { enqueueSnackbar } = useSnackbar();
  
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  
  const [openForm, setOpenForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false); 
  const [activeStep, setActiveStep] = useState(0);
  const [view, setView] = useState('home'); // 'home' or 'form'
const initialFormState = {
  title: '',
  startDate: null,
  endDate: null,
  venue: '',
  mode: 'Online',
  duration: '',
  type: '',
  objectives: '',
  outcomes: '',
  budget: '',
  brochure: null,
  coordinators: [{ name: '', designation: '', department: '' }],
  targetAudience: [],
  resourcePersons: [],
  registrationFees: [{ category: '', amount: '', gstPercentage: '' }],
  approvers: [{ name: '', role: '', status: 'Pending' }],
  paymentDetails: { mode: [], payTo: '' },
  budgetBreakdown: {
    income: { expectedParticipants: '', perParticipantAmount: '', total: '' },
    expenses: [{ category: '', amount: '' }],
    totalExpenditure: '',
    universityOverhead: '',
    gstAmount: ''
  },
  createdBy:user._id,
};
const [formData, setFormData] = useState(initialFormState);


  const steps = [
    'Basic Details',
    'Coordinators',
    'Participants',
    'Financials',
    'Review'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5050/api/coordinator/programmes');
        setEvents(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError(err.message);
        enqueueSnackbar('Failed to load events', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  useEffect(() => {
  // Calculate income total
  const participants = Number(formData.budgetBreakdown?.income?.expectedParticipants) || 0;
  const amountPer = Number(formData.budgetBreakdown?.income?.perParticipantAmount) || 0;
  const incomeTotal = participants * amountPer;

  // Calculate expenses total
  const expensesTotal = formData.budgetBreakdown?.expenses?.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0), 0
  ) || 0;

  setFormData(prev => ({
    ...prev,
    budgetBreakdown: {
      ...prev.budgetBreakdown,
      income: {
        ...prev.budgetBreakdown?.income,
        total: incomeTotal
      },
      totalExpenditure: expensesTotal
    }
  }));
}, [
  formData.budgetBreakdown?.income?.expectedParticipants,
  formData.budgetBreakdown?.income?.perParticipantAmount,
  formData.budgetBreakdown?.expenses
]);


const handleEdit = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5050/api/coordinator/programmes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;

    setFormData({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    });

    setEditId(id);
    setOpenForm(true);
    setActiveStep(0);

  } catch (error) {
    console.error('❌ Error loading programme for editing:', error);
    enqueueSnackbar('Failed to load programme details', { variant: 'error' });
  }
};


const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this note order?')) return;

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5050/api/coordinator/programmes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    enqueueSnackbar('Note Order deleted successfully', { variant: 'success' });
    await fetchEvents(); // refresh list

  } catch (error) {
    console.error('❌ Error deleting programme:', error);
    enqueueSnackbar('Failed to delete Note Order', { variant: 'error' });
  }
};



 const fetchEvents = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5050/api/coordinator/programmes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Ensure we always set an array, even if response.data is null/undefined
    setEvents(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    setEvents([]); // Fallback to empty array on error
    enqueueSnackbar('Failed to load events', { variant: 'error' });
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleNestedChange = (section, field, value, index = null) => {
  setFormData(prev => {
    const updated = { ...prev };

    // Deep nested (e.g., budgetBreakdown.income)
    if (section.includes('.')) {
      const [parent, child] = section.split('.');

      // Ensure parent exists
      if (!updated[parent]) updated[parent] = {};

      // Ensure child object exists
      if (!updated[parent][child]) updated[parent][child] = {};

      // If it's an array (like expenses)
      if (Array.isArray(updated[parent][child])) {
        updated[parent][child][index] = {
          ...updated[parent][child][index],
          [field]: value
        };
      } else {
        updated[parent][child] = {
          ...updated[parent][child],
          [field]: value
        };
      }
    }

    // Top-level array (like coordinators)
    else if (Array.isArray(updated[section])) {
      updated[section][index] = {
        ...updated[section][index],
        [field]: value
      };
    }

    // Object field (like budgetBreakdown.gstAmount)
    else {
      if (!updated[section]) updated[section] = {};
      updated[section] = {
        ...updated[section],
        [field]: value
      };
    }

    return updated;
  });
};





  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, brochure: e.target.files[0] });
  };

  const handleAddCoordinator = () => {
    setFormData({
      ...formData,
      coordinators: [...formData.coordinators, { name: '', designation: '', department: '' }]
    });
  };

  const handleRemoveCoordinator = (index) => {
    const updated = formData.coordinators.filter((_, i) => i !== index);
    setFormData({ ...formData, coordinators: updated });
  };
  // In your Dashboard.js component
const handleGeneratePDF = async (programmeId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/coordinator/programmes/${programmeId}/pdf`, {
      responseType: 'blob', // Important for file downloads
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Create a blob URL for the PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Programme_${programmeId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error generating PDF:', error);
    enqueueSnackbar('Failed to generate PDF', { variant: 'error' });
  }
};



  const validateCurrentStep = () => {
  switch(activeStep) {
    case 0: // Basic Details
      return !!(
        formData.title && 
        formData.startDate && 
        formData.endDate && 
        formData.venue && 
        formData.duration && 
        formData.type
      );
    case 1: // Coordinators
      return formData.coordinators.every(c => c.name && c.designation && c.department);
    case 2: // Participants
      return formData.targetAudience.length > 0;
    case 3: // Financials
      return formData.registrationFees.every(f => f.amount && f.category) && 
             formData.paymentDetails.mode.length > 0;
    case 4: // Review
      return validateForm();
    default:
      return true;
  }
};


const handleNext = () => {
  if (activeStep < steps.length - 1) {
    setActiveStep(prev => prev + 1);
  }
};

  const validateBudget = () => {
  const { income, expenses } = formData.budgetBreakdown;
  return (
    Number(income.expectedParticipants) > 0 &&
    Number(income.perParticipantAmount) > 0 &&
    expenses.every(exp => exp.category && Number(exp.amount) > 0)
  );
};

 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('✅ Submit clicked');

  if (submitting) return;
  setSubmitting(true);
  
  try {
    console.log("🔍 Validating form...");
    // 1. Validate fields
    const isValid = validateForm();
    if (!isValid) {
      enqueueSnackbar('Please fill all required fields correctly', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    // 2. Validate dates
    if (!formData.startDate || isNaN(new Date(formData.startDate))) {
      throw new Error('Start Date is missing or invalid');
    }
    if (!formData.endDate || isNaN(new Date(formData.endDate))) {
      throw new Error('End Date is missing or invalid');
    }

    // 3. Validate token
    console.log("🔑 Checking token...");
    const token = localStorage.getItem('token');
    if (!token) {
      enqueueSnackbar('Session expired. Please login again.', {
        variant: 'error',
        persist: true
      });
      setSubmitting(false);
      return;
    }

    // 4. Build FormData
     console.log("📦 Building FormData...");
    const formPayload = new FormData();

    // 4a. Append basic fields
    formPayload.append('title', formData.title.trim());
    formPayload.append('startDate', new Date(formData.startDate).toISOString());
    formPayload.append('endDate', new Date(formData.endDate).toISOString());
    console.log("📊 Dates added:", formData.startDate, formData.endDate);
    formPayload.append('venue', formData.venue.trim());
    formPayload.append('mode', formData.mode);
    formPayload.append('duration', formData.duration.trim());
    formPayload.append('type', formData.type.trim());
    formPayload.append('objectives', formData.objectives.trim());
    formPayload.append('outcomes', formData.outcomes.trim());
    formPayload.append('budget', formData.budget ? formData.budget.toString() : '0');
      
    // 4b. Safely append JSON fields
    try {
      formPayload.append('coordinators', JSON.stringify(
        Array.isArray(formData.coordinators)
          ? formData.coordinators.filter(c => c.name?.trim() && c.designation?.trim())
          : []
      ));
      formPayload.append('targetAudience', JSON.stringify(
        Array.isArray(formData.targetAudience)
          ? formData.targetAudience.filter(a => a.trim())
          : []
      ));
      formPayload.append('resourcePersons', JSON.stringify(formData.resourcePersons || []));
      formPayload.append('registrationFees', JSON.stringify(formData.registrationFees || []));
      formPayload.append('approvers', JSON.stringify(formData.approvers || []));
      formPayload.append('paymentDetails', JSON.stringify(formData.paymentDetails || {}));
      formPayload.append('budgetBreakdown', JSON.stringify(formData.budgetBreakdown || {}));
    } catch (err) {
      throw new Error("Failed to prepare nested fields: " + err.message);
    }

    // 4c. Handle brochure file
    if (formData.brochure instanceof File) {
      if (formData.brochure.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }
      formPayload.append('brochure', formData.brochure);
    }

    console.log('📤 Sending to backend...');
    if (editId) {
  // Edit mode
  await axios.put(`http://localhost:5050/api/coordinator/programmes/${editId}`, formPayload, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });

  enqueueSnackbar('Note Order updated successfully!', { variant: 'success' });
  await fetchEvents();
} else {
  // Create mode
  await axios.post('http://localhost:5050/api/coordinator/programmes', formPayload, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });

  enqueueSnackbar('Note Order created successfully!', { variant: 'success' });
}


    // 5. Send API request
    const response = await axios.post('http://localhost:5050/api/coordinator/programmes', formPayload, {
      headers: {
        
        'Authorization': `Bearer ${token}`,
      },
      timeout: 30000
    });
        console.log("✅ Success:", response.status);

    console.log('✅ Form submitted successfully:', response.data);
    setEditId(null);


    // 6. Success: close dialog, reset form, reload events
    enqueueSnackbar('Note Order created successfully!', {
      variant: 'success',
      autoHideDuration: 2000
    });
     

    setOpenForm(false);
    console.log("✅ Dialog closed");

    resetForm();
    setActiveStep(0);
   

  }catch (error) {
    console.error("❌ Submission error:", error);

    if (error.response) {
      // Server responded with a status other than 2xx
      console.error("📦 Server error response:", error.response.data);
      console.error("📦 HTTP Status:", error.response.status);

      // Optionally parse and show user-friendly message
      const serverData = error.response.data;

      let message = 'Something went wrong';
      if (serverData.message) {
        message = serverData.message;
      } else if (typeof serverData === 'string') {
        message = serverData;
      } else if (serverData.errors) {
        // If backend sent multiple field errors
        message = Object.values(serverData.errors).join(', ');
      }

      enqueueSnackbar(message, { variant: 'error', autoHideDuration: 4000 });

    } else if (error.request) {
      // Request was made but no response received
      console.error("🕸 No response received. Request was:", error.request);
      enqueueSnackbar('No response from server. Check your network.', {
        variant: 'error',
        autoHideDuration: 4000,
      });
    } else {
      // Something went wrong while setting up the request
      console.error("🧨 Request setup error:", error.message);
      enqueueSnackbar(`Error: ${error.message}`, {
        variant: 'error',
        autoHideDuration: 4000,
      });
    }

  } finally {
    setSubmitting(false);
  }
};


// Helper function to reset form
const resetForm = () => {
  setFormData(initialFormState);
};
// Validation function
const validateForm = () => {
  // Required fields check
  const requiredFields = {
    title: formData.title,
    startDate: formData.startDate,
    endDate: formData.endDate,
    venue: formData.venue,
    duration: formData.duration,
    type: formData.type,
    objectives: formData.objectives,
    outcomes: formData.outcomes
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate coordinators
  if (!formData.coordinators?.length) {
    console.error('At least one coordinator required');
    return false;
  }
  for (const coord of formData.coordinators) {
    if (!coord.name?.trim() || !coord.designation?.trim()) {
      console.error('Coordinator missing name or designation');
      return false;
    }
  }

  // Validate target audience
  if (!formData.targetAudience?.length) {
    console.error('Target audience required');
    return false;
  }

  // Validate registration fees
  if (!formData.registrationFees?.length) {
    console.error('At least one registration fee required');
    return false;
  }
  for (const fee of formData.registrationFees) {
    if (!fee.category || isNaN(fee.amount)) {
      console.error('Invalid registration fee');
      return false;
    }
  }

  return true;
};



  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip icon={<CheckCircle />} label="Rejected" color="error" size="small" />;
      default:
        return <Chip icon={<PendingActions />} label="Pending" color="warning" size="small" />;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load dashboard data: {error}
          <Button 
            onClick={() => window.location.reload()} 
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Coordinator Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ px: 4, py: 1.5 }}
          >
            Create Note Order
          </Button>
          <Button variant="outlined">Log out</Button>
        </Box>

        {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    ) : (
      /* Events Grid - PASTE THE PROVIDED CODE HERE */
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id || Math.random()}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderLeft: `4px solid ${
                event.status === 'approved' ? '#4caf50' : 
                event.status === 'rejected' ? '#f44336' : '#ff9800'
              }`
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {event.title}
                  </Typography>
                  {getStatusChip(event.status)}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  color: 'text.secondary'
                }}>
                  <EventAvailable fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Chip 
                    label={`${event.mode} • ${event.duration}`} 
                    size="small" 
                    color="default"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`₹${event.budget}`}
                    size="small"
                    color="primary"
                    icon={<MonetizationOn fontSize="small" />}
                  />
                </Box>
                
                <Typography variant="body2" paragraph>
                  <strong>Venue:</strong> {event.venue}
                </Typography>
                
                {event.coordinators?.length > 0 && (
                  <Typography variant="body2">
                    <strong>Coordinators:</strong> {event.coordinators.map(c => c.name).join(', ')}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button 
                  size="small" 
                  startIcon={<Receipt />}
                  onClick={() => window.open(`http://localhost:5050/api/coordinator/programmes/${event._id}/pdf`, '_blank')}
                >
                  PDF
                </Button>
                <Button 
                  size="small" 
                  startIcon={<Edit />}
                  onClick={() => handleEdit(event._id)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  startIcon={<Delete />} 
                  color="error"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      /* End of Events Grid */
    )}

        <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
           
          <DialogTitle sx={{ borderBottom: '1px solid #eee', py: 2 }}>
            <Typography variant="h6" component="div">
              Create New Note Order
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
         
          <DialogContent sx={{ py: 4 }}>
            
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Event Title *"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Event Type *"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date *"
                      value={formData.startDate}
                      onChange={(date) => handleDateChange('startDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="End Date *"
                      value={formData.endDate}
                      onChange={(date) => handleDateChange('endDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Venue *"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Mode *</InputLabel>
                      <Select
                        name="mode"
                        value={formData.mode}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="Online">Online</MenuItem>
                        <MenuItem value="Offline">Offline</MenuItem>
                        <MenuItem value="Hybrid">Hybrid</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Duration *"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Budget (₹) *"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Objectives *"
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={3}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Expected Outcomes *"
                      name="outcomes"
                      value={formData.outcomes}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={3}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AttachFile />}
                    >
                      Upload Brochure
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                      />
                    </Button>
                    {formData.brochure && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {formData.brochure.name}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  {formData.coordinators.map((coordinator, index) => (
                    <React.Fragment key={index}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Coordinator Name *"
                          value={coordinator.name}
                          onChange={(e) => handleNestedChange('coordinators', 'name', e.target.value, index)}
                          required
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Designation *"
                          value={coordinator.designation}
                          onChange={(e) => handleNestedChange('coordinators', 'designation', e.target.value, index)}
                          required
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Department *"
                          value={coordinator.department}
                          onChange={(e) => handleNestedChange('coordinators', 'department', e.target.value, index)}
                          required
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                        {index > 0 && (
                          <IconButton onClick={() => handleRemoveCoordinator(index)} color="error">
                            <Delete />
                          </IconButton>
                        )}
                      </Grid>
                    </React.Fragment>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddCoordinator}
                    >
                      Add Coordinator
                    </Button>
                  </Grid>
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                 <Grid item xs={12}>
  <TextField
    fullWidth
    label="Target Audience (comma separated) *"
    value={Array.isArray(formData.targetAudience) ? formData.targetAudience.join(', ') : ''}
    onChange={(e) => {
      const values = e.target.value
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');
      setFormData({
        ...formData,
        targetAudience: values
      });
    }}
    required
    margin="normal"
    multiline
    rows={2}
    helperText="Enter comma-separated values (e.g., Students, Faculty, Researchers)"
  />
</Grid>
                  <Grid item xs={12}>
  <TextField
    fullWidth
    label="Resource Persons (comma separated)"
    value={Array.isArray(formData.resourcePersons) ? formData.resourcePersons.join(', ') : ''}
    onChange={(e) => {
      const values = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
      setFormData({...formData, resourcePersons: values});
    }}
    margin="normal"
    multiline
    rows={2}
  />
</Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Approvers
                    </Typography>
                    {formData.approvers.map((approver, index) => (
                      <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={5}>
                          <TextField
                            fullWidth
                            label="Approver Name"
                            value={approver.name}
                            onChange={(e) => handleNestedChange('approvers', 'name', e.target.value, index)}
                            required
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <TextField
                            fullWidth
                            label="Role"
                            value={approver.role}
                            onChange={(e) => handleNestedChange('approvers', 'role', e.target.value, index)}
                            required
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={approver.status}
                              onChange={(e) => handleNestedChange('approvers', 'status', e.target.value, index)}
                            >
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Approved">Approved</MenuItem>
                              <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {activeStep === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Registration Fees
                    </Typography>
                    {formData.registrationFees.map((fee, index) => (
                      <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Category"
                            value={fee.category}
                            onChange={(e) => handleNestedChange('registrationFees', 'category', e.target.value, index)}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={fee.amount}
                            onChange={(e) => handleNestedChange('registrationFees', 'amount', e.target.value, index)}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="GST %"
                            type="number"
                            value={fee.gstPercentage}
                            onChange={(e) => handleNestedChange('registrationFees', 'gstPercentage', e.target.value, index)}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Payment Modes (comma separated) *"
                      value={formData.paymentDetails.mode.join(', ')}
                      onChange={(e) => handleNestedChange('paymentDetails', 'mode', e.target.value.split(',').map(s => s.trim()))}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pay To *"
                      value={formData.paymentDetails.payTo}
                      onChange={(e) => handleNestedChange('paymentDetails', 'payTo', e.target.value)}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                      Budget Breakdown
                    </Typography>
                  
  
                   <Grid container spacing={2}>
  {/* INCOME Section */}
  <Grid item xs={12}>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      Income
    </Typography>
  </Grid>

  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Expected Participants *"
      type="number"
      value={formData.budgetBreakdown?.income?.expectedParticipants || ''}
      onChange={(e) => handleNestedChange(
        'budgetBreakdown.income',
        'expectedParticipants',
        e.target.value
      )}
      required
      margin="normal"
    />
  </Grid>

  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Per Participant Amount *"
      type="number"
      value={formData.budgetBreakdown?.income?.perParticipantAmount || ''}
      onChange={(e) => handleNestedChange(
        'budgetBreakdown.income',
        'perParticipantAmount',
        e.target.value
      )}
      required
      margin="normal"
    />
  </Grid>

  <Grid item xs={12} md={4}>
    <TextField
  fullWidth
  label="Income Total"
  type="number"
  value={
    Number(formData.budgetBreakdown?.income?.expectedParticipants || 0) *
    Number(formData.budgetBreakdown?.income?.perParticipantAmount || 0)
  }
  margin="normal"
  InputProps={{ readOnly: true }}
/>

  </Grid>

  {/* EXPENSES Section */}
  <Grid item xs={12}>
    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
      Expenses
    </Typography>
  </Grid>

  {formData.budgetBreakdown?.expenses?.map((expense, index) => (
    <React.Fragment key={index}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Expense Category"
          value={expense.category || ''}
          onChange={(e) =>
            handleNestedChange('budgetBreakdown.expenses', 'category', e.target.value, index)
          }
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={expense.amount || ''}
          onChange={(e) =>
            handleNestedChange('budgetBreakdown.expenses', 'amount', e.target.value, index)
          }
          margin="normal"
        />
      </Grid>
    </React.Fragment>
  ))}

  {/* You can add a button here to add more expenses if needed */}
  {/* <Grid item xs={12}>
    <Button variant="outlined" onClick={handleAddExpense}>Add Expense</Button>
  </Grid> */}

  {/* TOTALS Section */}
  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Total Expenditure"
      type="number"
      value={formData.budgetBreakdown.totalExpenditure || ''}
      onChange={(e) =>
        handleNestedChange('budgetBreakdown', 'totalExpenditure', e.target.value)
      }
      margin="normal"
    />
  </Grid>

  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="University Overhead"
      type="number"
      value={formData.budgetBreakdown.universityOverhead || ''}
      onChange={(e) =>
        handleNestedChange('budgetBreakdown', 'universityOverhead', e.target.value)
      }
      margin="normal"
    />
  </Grid>

  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="GST Amount"
      type="number"
      value={formData.budgetBreakdown.gstAmount || ''}
      onChange={(e) =>
        handleNestedChange('budgetBreakdown', 'gstAmount', e.target.value)
      }
      margin="normal"
    />
  </Grid>
</Grid>
</Grid>

</Grid>

 )}

              {activeStep === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review Your Note Order
                  </Typography>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Event Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>Title:</strong> {formData.title}</Typography>
                        <Typography variant="body2"><strong>Type:</strong> {formData.type}</Typography>
                        <Typography variant="body2"><strong>Venue:</strong> {formData.venue}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2"><strong>Dates:</strong> {formData.startDate?.toLocaleDateString()} to {formData.endDate?.toLocaleDateString()}</Typography>
                        <Typography variant="body2"><strong>Mode:</strong> {formData.mode}</Typography>
                        <Typography variant="body2"><strong>Duration:</strong> {formData.duration}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Coordinators
                    </Typography>
                    {formData.coordinators.map((coord, index) => (
                      <Typography key={index} variant="body2">
                        {coord.name} ({coord.designation}, {coord.department})
                      </Typography>
                    ))}
                  </Paper>

                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Financial Details
                    </Typography>
                    <Typography variant="body2"><strong>Budget:</strong> ₹{formData.budget}</Typography>
                    <Typography variant="body2"><strong>Income Total:</strong> ₹{formData.budgetBreakdown.income.total}</Typography>
                    <Typography variant="body2"><strong>Total Expenditure:</strong> ₹{formData.budgetBreakdown.totalExpenditure}</Typography>
                  </Paper>
                </Box>
              )}
            
          </DialogContent>
          {console.log("🧪 activeStep", activeStep, "last step:", steps.length - 1)}
          
          <DialogActions sx={{ borderTop: '1px solid #eee', px: 3, py: 2 }}>
  <Button
    disabled={activeStep === 0}
    onClick={handleBack}
    sx={{ mr: 1 }}
  >
    Back
  </Button>
  <Box sx={{ flex: '1 1 auto' }} />
  
  {activeStep === steps.length - 1 ? (
    <Button
      variant="contained"
      onClick={handleSubmit}
      
      disabled={!validateForm()}
      sx={{
        minWidth: 150,
        bgcolor: '#1976d2',
        '&:hover': { bgcolor: '#1565c0' },
        '&:disabled': { bgcolor: '#e0e0e0' }
      }}
    >
      {submitting ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        'Submit Note Order'
      )}
    </Button>
  ) : (
    <Button
      variant="contained"
      onClick={handleNext}
      disabled={!validateCurrentStep()}
      sx={{
        minWidth: 100,
        bgcolor: '#1976d2',
        '&:hover': { bgcolor: '#1565c0' },
        '&:disabled': { bgcolor: '#e0e0e0' }
      }}
    >
      Next
    </Button>
  )}
</DialogActions>
</form>
       
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default Dashboard;


