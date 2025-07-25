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
        'http://localhost:4000/api/coordinator/participants/add',
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
        'http://localhost:4000/api/coordinator/participants/add-multiple',
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
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      enqueueSnackbar('Please select a file to upload', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('eventId', eventId);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/coordinator/participants/upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploadResults(response.data.results);
      enqueueSnackbar('File uploaded successfully!', { variant: 'success' });
      onParticipantAdded();
    } catch (error) {
      console.error('Error uploading file:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error uploading file',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:4000/api/coordinator/participants/template',
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'participants_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Template downloaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading template:', error);
      enqueueSnackbar('Error downloading template', { variant: 'error' });
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
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload a CSV or Excel file with participant data. Download the template to see the required format.
            </Alert>

            <Box display="flex" gap={2} mb={3}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadTemplate}
              >
                Download Template
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <input
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                id="csv-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="csv-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {csvFile ? csvFile.name : 'Choose File'}
                </Button>
              </label>
            </Box>

            {uploadResults && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Results:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={`Added: ${uploadResults.added}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={`Updated: ${uploadResults.updated}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="info" />
                    </ListItemIcon>
                    <ListItemText primary={`Skipped: ${uploadResults.skipped}`} />
                  </ListItem>
                  {uploadResults.errors.length > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Errors: ${uploadResults.errors.length}`}
                        secondary={uploadResults.errors.slice(0, 3).join('; ')}
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