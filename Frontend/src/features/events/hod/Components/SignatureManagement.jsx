import React, { useState, useRef, useEffect } from 'react';
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
  Tabs,
  Tab
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Preview,
  Save,
  Close,
  CheckCircle,
  Warning,
  Info,
  Edit,
  Image
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import SignatureDrawingPad from './SignatureDrawingPad';

const SignatureManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  
  const [signature, setSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [accessError, setAccessError] = useState(null);

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    // Since the user is already authenticated (as shown in logs),
    // let's directly try to fetch the signature
    // The signature endpoint will handle access control
    fetchSignature();
  };

  const fetchSignature = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/hod/signature`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSignature(response.data.data);
        setAccessError(null);
      }
    } catch (error) {
      console.error('Error fetching signature:', error);
      if (error.response?.status === 403) {
        setAccessError(error.response.data.message || 'Access denied. HOD role required.');
      } else if (error.response?.status !== 404) {
        enqueueSnackbar('Failed to load signature', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select an image file', { variant: 'error' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('File size must be less than 5MB', { variant: 'error' });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setPreviewOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSignature = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/hod/signature/upload`,
          {
            imageData: base64Data,
            fileName: selectedFile.name
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setSignature(response.data.data);
          setSelectedFile(null);
          setPreviewUrl(null);
          setPreviewOpen(false);
          enqueueSnackbar('Signature uploaded successfully', { variant: 'success' });
        }
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error uploading signature:', error);
      enqueueSnackbar('Failed to upload signature', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSignature = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/hod/signature`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSignature(null);
        enqueueSnackbar('Signature deleted successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
      enqueueSnackbar('Failed to delete signature', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSignature = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/hod/signature/activate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSignature(response.data.data);
        enqueueSnackbar('Signature activated successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error activating signature:', error);
      enqueueSnackbar('Failed to activate signature', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const PreviewDialog = () => (
    <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Signature Preview</Typography>
          <IconButton onClick={() => setPreviewOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {previewUrl && (
          <Box textAlign="center" p={2}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                display: 'inline-block',
                backgroundColor: '#f9f9f9',
                border: '2px dashed #ddd'
              }}
            >
              <img 
                src={previewUrl} 
                alt="Signature Preview"
                style={{ 
                  maxWidth: '400px',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }}
              />
            </Paper>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This signature will appear on certificates as:
            </Typography>
            
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {(() => {
                  const userName = JSON.parse(localStorage.getItem('userInfo') || '{}').name || 'Department Head';
                  return userName.toLowerCase().startsWith('dr.') ? userName : `Dr. ${userName}`;
                })()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                HEAD OF DEPARTMENT
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Department of CSE
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleUploadSignature}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={16} /> : <Save />}
        >
          {uploading ? 'Uploading...' : 'Save Signature'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading && !signature && !accessError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (accessError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Signature Management
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2">
            {accessError}
          </Typography>
          {userInfo && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Current User Info:</strong><br />
                Name: {userInfo.name}<br />
                Email: {userInfo.email}<br />
                Role: {userInfo.role}<br />
                Department: {userInfo.department || 'Not set'}<br />
                Active: {userInfo.isActive ? 'Yes' : 'No'}
              </Typography>
            </Box>
          )}
        </Alert>
        
        <Alert severity="info">
          <Typography variant="body2">
            <strong>To access signature management:</strong><br />
            • You need to have the 'hod' or 'admin' role<br />
            • Your account must be active<br />
            • Contact your system administrator if you believe this is an error
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Signature Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload and manage your digital signature for certificates. Your signature will appear on all certificates issued for events in your department.
      </Typography>

      <Grid container spacing={3}>
        {/* Current Signature */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Signature
              </Typography>
              
              {signature ? (
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Chip 
                      icon={signature.isActive ? <CheckCircle /> : <Warning />}
                      label={signature.isActive ? 'Active' : 'Inactive'}
                      color={signature.isActive ? 'success' : 'warning'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Uploaded: {new Date(signature.uploadedAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <img 
                      src={signature.imageData} 
                      alt="Current Signature"
                      style={{ 
                        maxWidth: '300px',
                        maxHeight: '150px',
                        objectFit: 'contain'
                      }}
                    />
                  </Paper>

                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {(() => {
                        const userName = JSON.parse(localStorage.getItem('userInfo') || '{}').name || 'Department Head';
                        return userName.toLowerCase().startsWith('dr.') ? userName : `Dr. ${userName}`;
                      })()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      HEAD OF DEPARTMENT
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Department of CSE
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No signature uploaded yet. Upload a signature to use on certificates.
                </Alert>
              )}
            </CardContent>

            <CardActions>
              {signature && (
                <>
                  {!signature.isActive && (
                    <Tooltip title={loading ? "Processing..." : "Activate signature"}>
                      <span>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleActivateSignature}
                          disabled={loading}
                          startIcon={<CheckCircle />}
                        >
                          Activate
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                  
                  <Tooltip title={loading ? "Processing..." : "Delete signature"}>
                    <span>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteSignature}
                        disabled={loading}
                        startIcon={<Delete />}
                      >
                        Delete
                      </Button>
                    </span>
                  </Tooltip>
                </>
              )}
            </CardActions>
          </Card>
        </Grid>

        {/* Create New Signature */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create New Signature
              </Typography>
              
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab 
                  icon={<Edit />} 
                  label="Draw" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<Image />} 
                  label="Upload" 
                  iconPosition="start"
                />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Draw your signature:</strong>
                      <br />• Use your mouse or touch to draw
                      <br />• Keep it simple and clear
                      <br />• You can adjust pen settings
                    </Typography>
                  </Alert>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Edit />}
                    onClick={() => {
                      // This will be handled by the drawing pad component
                    }}
                  >
                    Open Drawing Pad
                  </Button>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Upload guidelines:</strong>
                      <br />• Use a clear, high-quality image
                      <br />• Transparent background preferred
                      <br />• Maximum file size: 5MB
                      <br />• Supported formats: PNG, JPG, JPEG
                    </Typography>
                  </Alert>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Select Signature Image
                  </Button>

                  {selectedFile && (
                    <Alert severity="success">
                      Selected: {selectedFile.name}
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Usage Information */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Usage Information
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Your signature will automatically appear on:
              </Typography>
              
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <Typography component="li" variant="body2">
                  Event completion certificates
                </Typography>
                <Typography component="li" variant="body2">
                  Training program certificates
                </Typography>
                <Typography component="li" variant="body2">
                  Workshop participation certificates
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drawing Pad Section */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <SignatureDrawingPad 
            onSignatureSaved={(newSignature) => {
              setSignature(newSignature);
              fetchSignature(); // Refresh the signature data
            }}
            existingSignature={signature}
          />
        </Box>
      )}

      <PreviewDialog />
    </Box>
  );
};

export default SignatureManagement;