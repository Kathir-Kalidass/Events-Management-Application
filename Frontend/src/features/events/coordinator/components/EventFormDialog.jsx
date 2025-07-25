import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Import form step components
import BasicDetailsStep from './formSteps/BasicDetailsStep';
import CoordinatorsStep from './formSteps/CoordinatorsStep';
import ParticipantsStep from './formSteps/ParticipantsStep';
import RegistrationStep from './formSteps/RegistrationStep';
import FinancialsStep from './formSteps/FinancialsStep';
import ReviewStep from './formSteps/ReviewStep';

const EventFormDialog = ({
  open,
  onClose,
  formData,
  setFormData,
  editId,
  activeStep,
  setActiveStep,
  submitting,
  onSubmit,
  newTargetAudience,
  setNewTargetAudience,
  newResourcePerson,
  setNewResourcePerson
}) => {
  const theme = useTheme();

  const steps = [
    "Basic Details",
    "Coordinators", 
    "Participants",
    "Registration",
    "Financials",
    "Review",
  ];

  const validateCurrentStep = () => {
    switch (activeStep) {
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
        return formData.coordinators?.every(
          (c) => c.name && c.designation && c.department
        );
      case 2: // Participants
        return formData.targetAudience?.length > 0;
      case 3: // Registration (optional step, always valid)
        return true;
      case 4: // Financials
        return (
          formData.budgetBreakdown?.income?.length > 0 &&
          formData.budgetBreakdown?.expenses?.length > 0
        );
      case 5: // Review
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <BasicDetailsStep
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 1:
        return (
          <CoordinatorsStep
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <ParticipantsStep
            formData={formData}
            setFormData={setFormData}
            newTargetAudience={newTargetAudience}
            setNewTargetAudience={setNewTargetAudience}
            newResourcePerson={newResourcePerson}
            setNewResourcePerson={setNewResourcePerson}
          />
        );
      case 3:
        return (
          <RegistrationStep
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <FinancialsStep
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '70vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 2 }}>
            {editId ? "Edit Note Order" : "Create New Note Order"}
          </Typography>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            sx={{ 
              mt: 2,
              '& .MuiStepLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500
              },
              '& .MuiStepIcon-root': {
                fontSize: '1.5rem'
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>

        <form onSubmit={onSubmit}>
          <DialogContent sx={{ py: 4, minHeight: '400px' }}>
            <Box sx={{ width: '100%' }}>
              {renderStepContent()}
            </Box>
          </DialogContent>

          <DialogActions 
            sx={{ 
              p: 3, 
              borderTop: `1px solid ${theme.palette.divider}`,
              background: alpha(theme.palette.background.default, 0.5),
              gap: 2
            }}
          >
            <Button 
              onClick={onClose}
              sx={{ 
                borderRadius: 2,
                px: 3,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none'
                }}
              >
                Back
              </Button>
            )}

            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={!validateCurrentStep()}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !validateCurrentStep()}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                {submitting ? "Submitting..." : editId ? "Update Event" : "Create Event"}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EventFormDialog;