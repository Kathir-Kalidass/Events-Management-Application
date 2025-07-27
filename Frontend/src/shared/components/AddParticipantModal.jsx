import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PersonAdd,
  GroupAdd,
  Upload,
  Email,
  CheckCircle,
  Error,
  Warning,
  Delete,
  Download
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const AddParticipantModal = ({ open, onClose, eventId, onParticipantAdded }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Single participant form
  const [singleEmail, setSingleEmail] = useState('');

  // Multiple participants form
  const [emailList, setEmailList] = useState('');
  const [emailArray, setEmailArray] = useState([]);

  // CSV upload
  const [csvFile, setCsvFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset forms when switching tabs
    setSingleEmail('');
    setEmailList('');
    setEmailArray([]);
    setCsvFile(null);
    setUploadResults(null);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSingleParticipantAdd = async () => {
    if (!singleEmail.trim()) {
      enqueueSnackbar('Please enter an email address', { variant: 'error' });
      return;
    }

    if (!validateEmail(singleEmail)) {
      enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/participants/add`,
        {
          email: singleEmail.trim(),
          eventId: eventId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      enqueueSnackbar('Participant added successfully!', { variant: 'success' });
      setSingleEmail('');
      onParticipantAdded();
      onClose();
    } catch (error) {
      console.error('Error adding participant:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error adding participant',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const parseEmailList = () => {
    if (!emailList.trim()) {
      enqueueSnackbar('Please enter email addresses', { variant: 'error' });
      return;
    }

    // Split by comma, semicolon, or newline
    const emails = emailList
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const validEmails = [];
    const invalidEmails = [];

    emails.forEach(email => {
      if (validateEmail(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      enqueueSnackbar(
        `Invalid email addresses found: ${invalidEmails.join(', ')}`,
        { variant: 'warning' }
      );
    }

    setEmailArray(validEmails);
  };

  const removeEmail = (index) => {
    const newEmailArray = emailArray.filter((_, i) => i !== index);
    setEmailArray(newEmailArray);
  };

  const handleMultipleParticipantsAdd = async () => {
    if (emailArray.length === 0) {
      enqueueSnackbar('Please add some email addresses', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/participants/add-multiple`,
        {
          emails: emailArray,
          eventId: eventId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { results } = response.data;
      
      enqueueSnackbar(
        `Added: ${results.added}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
        { variant: 'success' }
      );

      if (results.errors.length > 0) {

      }

      setEmailList('');
      setEmailArray([]);
      onParticipantAdded();
      onClose();
    } catch (error) {
      console.error('Error adding multiple participants:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error adding participants',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        enqueueSnackbar('Please upload a valid Excel or CSV file', { variant: 'error' });
        return;
      }

      setCsvFile(file);
      setUploadResults(null); // Clear previous results when new file is selected
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      enqueueSnackbar('Please select a file to upload', { variant: 'error' });
      return;
    }

    if (!eventId) {
      enqueueSnackbar('Event ID is missing', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('eventId', eventId.toString());

      const token = localStorage.getItem('token');
      
      console.log('Uploading CSV with eventId:', eventId);
      console.log('File details:', { name: csvFile.name, size: csvFile.size, type: csvFile.type });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/participants/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type manually for FormData, let browser set it with boundary
          }
        }
      );

      setUploadResults(response.data.results);
      enqueueSnackbar('File uploaded successfully!', { variant: 'success' });
      onParticipantAdded();
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Show detailed error information
      const errorMessage = error.response?.data?.message || 'Error uploading file';
      const errors = error.response?.data?.errors || [];
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
      
      // If there are validation errors, show them in the results
      if (errors.length > 0) {
        setUploadResults({
          added: 0,
          updated: 0,
          skipped: 0,
          errors: errors
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template content with comprehensive examples
    const csvContent = `Full Name,Email Address,Department,Phone,Institution,Designation
Dr. John Doe,john.doe@university.edu,Computer Science,9876543210,Anna University,Professor
Ms. Jane Smith,jane.smith@student.edu,Information Technology,9876543211,Anna University,Student
Mr. Raj Kumar,raj.kumar@company.com,Electronics,9876543212,Industry Professional,Engineer
Prof. Sarah Wilson,sarah.wilson@college.edu,Mechanical Engineering,9876543213,Anna University,Associate Professor
Alex Johnson,alex.johnson@gmail.com,Civil Engineering,9876543214,Anna University,Student`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'participants_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    enqueueSnackbar('Template downloaded successfully!', { variant: 'success' });
  };

  const downloadExcelTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/coordinator/participants/template`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'participants_template_enhanced.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Excel template downloaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading Excel template:', error);
      enqueueSnackbar('Error downloading Excel template', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <GroupAdd color="primary" />
          Add Participants
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              icon={<PersonAdd />} 
              label="Single Participant" 
              iconPosition="start"
            />
            <Tab 
              icon={<GroupAdd />} 
              label="Multiple Participants" 
              iconPosition="start"
            />
            <Tab 
              icon={<Upload />} 
              label="CSV/Excel Upload" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Single Participant Tab */}
        {tabValue === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Add a single participant by email. The system will create a user account with the email as the initial password.
              The username will be the part before the @ symbol.
            </Alert>
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              placeholder="participant@example.com"
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              helperText="Enter the participant's email address"
            />
          </Box>
        )}

        {/* Multiple Participants Tab */}
        {tabValue === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Add multiple participants by entering email addresses separated by commas, semicolons, or new lines.
            </Alert>

            <TextField
              fullWidth
              label="Email Addresses"
              multiline
              rows={6}
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              placeholder="participant1@example.com, participant2@example.com&#10;participant3@example.com"
              helperText="Separate email addresses with commas, semicolons, or new lines"
              sx={{ mb: 2 }}
            />

            <Box display="flex" gap={2} mb={2}>
              <Button
                variant="outlined"
                onClick={parseEmailList}
                disabled={!emailList.trim()}
              >
                Parse Emails
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {emailArray.length} valid emails ready to add
              </Typography>
            </Box>

            {emailArray.length > 0 && (
              <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Email Addresses to Add:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {emailArray.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      onDelete={() => removeEmail(index)}
                      deleteIcon={<Delete />}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* CSV Upload Tab */}
        {tabValue === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Instructions for Bulk Upload:
              </Typography>
              <Typography variant="body2" component="div">
                1. Download the template file using the buttons below<br/>
                2. Fill in the template with participant data (do not modify column headers)<br/>
                3. Save the file and upload it below<br/>
                4. Supported formats: CSV (.csv), Excel (.xlsx, .xls)
              </Typography>
            </Alert>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Important Notes:
              </Typography>
              <Typography variant="body2" component="div">
                • Required columns: <strong>Full Name</strong> and <strong>Email Address</strong><br/>
                • Optional columns: Department, Phone, Institution, Designation<br/>
                • All uploaded participants are automatically approved<br/>
                • Email addresses are used as initial passwords<br/>
                • Duplicate participants for this event will be skipped
              </Typography>
            </Alert>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Required Columns:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
                  <strong>Full Name</strong> - Complete name with salutation (e.g., Dr. John Doe)<br/>
                  <strong>Email Address</strong> - Valid email format (e.g., john.doe@university.edu)<br/>
                  <strong>Department</strong> - Department name (optional)<br/>
                  <strong>Phone</strong> - Contact number (optional)<br/>
                  <strong>Institution</strong> - Institution name (optional)<br/>
                  <strong>Designation</strong> - Role/Position (optional)
                </Typography>
              </Paper>
            </Box>

            <Box display="flex" gap={2} mb={3}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={downloadTemplate}
                color="primary"
              >
                Download CSV Template
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadExcelTemplate}
                color="secondary"
              >
                Download Excel Template
              </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select File to Upload:
              </Typography>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ 
                  marginTop: 8,
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
              {csvFile && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                </Typography>
              )}
            </Box>

            {uploadResults && (
              <Paper sx={{ p: 2, bgcolor: 'background.default', mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Upload Results:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Successfully Added: ${uploadResults.added}`}
                      secondary="New participants created and approved"
                    />
                  </ListItem>
                  {uploadResults.updated > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Updated: ${uploadResults.updated}`}
                        secondary="Existing user information updated"
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Skipped: ${uploadResults.skipped}`}
                      secondary="Already registered for this event"
                    />
                  </ListItem>
                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Errors: ${uploadResults.errors.length}`}
                        secondary={
                          <>
                            <Typography variant="caption" color="error" component="span">
                              Issues found:
                            </Typography>
                            <br />
                            {uploadResults.errors.slice(0, 5).map((error, index) => (
                              <Typography key={index} variant="caption" color="error" component="span" sx={{ display: 'block' }}>
                                • {error}
                              </Typography>
                            ))}
                            {uploadResults.errors.length > 5 && (
                              <Typography variant="caption" color="error" component="span" sx={{ display: 'block' }}>
                                ... and {uploadResults.errors.length - 5} more errors
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        {tabValue === 0 && (
          <Button
            variant="contained"
            onClick={handleSingleParticipantAdd}
            disabled={loading || !singleEmail.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            Add Participant
          </Button>
        )}
        
        {tabValue === 1 && (
          <Button
            variant="contained"
            onClick={handleMultipleParticipantsAdd}
            disabled={loading || emailArray.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <GroupAdd />}
          >
            Add {emailArray.length} Participants
          </Button>
        )}
        
        {tabValue === 2 && (
          <Button
            variant="contained"
            onClick={handleCsvUpload}
            disabled={loading || !csvFile}
            startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
          >
            Upload File
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddParticipantModal;