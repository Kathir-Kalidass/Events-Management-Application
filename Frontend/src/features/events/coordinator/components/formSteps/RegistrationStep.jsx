import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Paper,
  FormControlLabel,
  Switch,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  HowToReg,
  ExpandMore,
  Payment,
  Assignment
} from '@mui/icons-material';

const RegistrationStep = ({ formData, setFormData }) => {
  const theme = useTheme();

  const handleRegistrationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      registrationProcedure: {
        ...prev.registrationProcedure,
        [field]: value
      }
    }));
  };

  const handlePaymentDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      registrationProcedure: {
        ...prev.registrationProcedure,
        paymentDetails: {
          ...prev.registrationProcedure.paymentDetails,
          [field]: value
        }
      }
    }));
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HowToReg color="warning" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registration Procedure
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Configure registration settings for your event (Optional)
        </Typography>
      </Paper>

      {/* Enable Registration Toggle */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.registrationProcedure?.enabled || false}
              onChange={(e) => handleRegistrationChange('enabled', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Enable Registration Procedure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Turn on to configure detailed registration settings for participants
              </Typography>
            </Box>
          }
        />
      </Paper>

      {/* Registration Details (only show if enabled) */}
      {formData.registrationProcedure?.enabled && (
        <Box sx={{ space: 3 }}>
          {/* Basic Registration Settings */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Basic Registration Settings
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Registration Instructions"
                    multiline
                    rows={3}
                    value={formData.registrationProcedure?.instructions || ''}
                    onChange={(e) => handleRegistrationChange('instructions', e.target.value)}
                    placeholder="Provide detailed instructions for participants on how to register"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Participant Limit"
                    type="number"
                    value={formData.registrationProcedure?.participantLimit || ''}
                    onChange={(e) => handleRegistrationChange('participantLimit', e.target.value)}
                    placeholder="Maximum number of participants"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Selection Criteria"
                    value={formData.registrationProcedure?.selectionCriteria || 'first come first served basis'}
                    onChange={(e) => handleRegistrationChange('selectionCriteria', e.target.value)}
                    placeholder="How participants will be selected"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    multiline
                    rows={2}
                    value={formData.registrationProcedure?.additionalNotes || ''}
                    onChange={(e) => handleRegistrationChange('additionalNotes', e.target.value)}
                    placeholder="Any additional information for participants"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Payment Details */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Payment color="success" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Payment Details
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.registrationProcedure?.paymentDetails?.enabled || false}
                      onChange={(e) => handlePaymentDetailsChange('enabled', e.target.checked)}
                      color="success"
                    />
                  }
                  label="Enable Payment Collection"
                />
              </Box>

              {formData.registrationProcedure?.paymentDetails?.enabled && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Name"
                      value={formData.registrationProcedure?.paymentDetails?.accountName || 'DIRECTOR, CSRC'}
                      onChange={(e) => handlePaymentDetailsChange('accountName', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={formData.registrationProcedure?.paymentDetails?.accountNumber || '37614464781'}
                      onChange={(e) => handlePaymentDetailsChange('accountNumber', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bank Branch"
                      value={formData.registrationProcedure?.paymentDetails?.bankBranch || 'State Bank of India, Anna University'}
                      onChange={(e) => handlePaymentDetailsChange('bankBranch', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      value={formData.registrationProcedure?.paymentDetails?.ifscCode || 'SBIN0006463'}
                      onChange={(e) => handlePaymentDetailsChange('ifscCode', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Payment Information"
                      multiline
                      rows={2}
                      value={formData.registrationProcedure?.paymentDetails?.additionalPaymentInfo || ''}
                      onChange={(e) => handlePaymentDetailsChange('additionalPaymentInfo', e.target.value)}
                      placeholder="Any additional payment instructions"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Information Note */}
          <Paper
            sx={{
              p: 3,
              mt: 3,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Registration procedure settings are optional and will be used for brochure generation 
              and participant management. You can always modify these settings later.
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default RegistrationStep;