import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Divider,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle,
  Event,
  LocationOn,
  Schedule,
  MonetizationOn,
  Group,
  Person,
  Business,
  TrendingUp,
  TrendingDown,
  HowToReg
} from '@mui/icons-material';

const ReviewStep = ({ formData }) => {
  const theme = useTheme();

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotals = () => {
    const totalIncome = formData.budgetBreakdown?.income?.reduce((sum, item) => {
      const participants = Number(item.expectedParticipants || 0);
      const amount = Number(item.perParticipantAmount || 0);
      const gst = Number(item.gstPercentage || 0);
      return sum + (participants * amount * (1 - gst / 100));
    }, 0) || 0;

    const totalExpenses = formData.budgetBreakdown?.expenses?.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0) || 0;

    return { totalIncome, totalExpenses };
  };

  const { totalIncome, totalExpenses } = calculateTotals();

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CheckCircle color="success" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Review Your Event Details
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Please review all the information before submitting your event
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Event color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Basic Details
              </Typography>
            </Box>
            
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Event Title"
                  secondary={formData.title || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Event Type"
                  secondary={formData.type || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Venue"
                  secondary={formData.venue || 'Not specified'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Schedule fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Duration"
                  secondary={`${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Mode & Duration"
                  secondary={`${formData.mode} • ${formData.duration}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <MonetizationOn fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Budget"
                  secondary={`₹${formData.budget || 0}`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Coordinators */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Person color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Coordinators
              </Typography>
            </Box>
            
            {formData.coordinators?.map((coordinator, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {coordinator.name}
                  {index === 0 && (
                    <Chip label="Primary" size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {coordinator.designation}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {coordinator.department}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Participants */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Group color="success" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Target Audience
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.targetAudience?.map((audience, index) => (
                <Chip
                  key={index}
                  label={audience}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ))}
            </Box>

            {formData.resourcePersons?.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                  Resource Persons
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.resourcePersons.map((person, index) => (
                    <Chip
                      key={index}
                      label={person}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Financial Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <MonetizationOn color="warning" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Financial Summary
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Income:</Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                  ₹{totalIncome.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Expenses:</Typography>
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                  ₹{totalExpenses.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Net Balance:</Typography>
                <Typography 
                  variant="subtitle2" 
                  color={totalIncome - totalExpenses >= 0 ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 600 }}
                >
                  ₹{(totalIncome - totalExpenses).toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Income Sources */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Income Sources ({formData.budgetBreakdown?.income?.length || 0})
            </Typography>
            {formData.budgetBreakdown?.expenses?.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                  Expense Categories ({formData.budgetBreakdown?.expenses?.length || 0})
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Objectives & Outcomes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Objectives & Expected Outcomes
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Objectives
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.objectives || 'Not specified'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Expected Outcomes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.outcomes || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Registration Procedure */}
        {formData.registrationProcedure?.enabled && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <HowToReg color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Registration Procedure
                </Typography>
                <Chip label="Enabled" size="small" color="success" />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Registration procedure has been configured for this event.
                {formData.registrationProcedure?.paymentDetails?.enabled && (
                  <> Payment collection is enabled.</>
                )}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Validation Status */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CheckCircle color="success" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                Ready to Submit
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              All required information has been provided. You can now submit your event for approval.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReviewStep;