import React from 'react';
import {
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Paper,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add,
  Delete,
  Person,
  Business,
  Work
} from '@mui/icons-material';

const CoordinatorsStep = ({ formData, setFormData }) => {
  const theme = useTheme();

  const handleNestedChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (Array.isArray(updated[section]) && index !== null) {
        updated[section][index] = {
          ...updated[section][index],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const handleAddCoordinator = () => {
    setFormData({
      ...formData,
      coordinators: [
        ...formData.coordinators,
        { name: "", designation: "", department: "" },
      ],
    });
  };

  const handleRemoveCoordinator = (index) => {
    const updated = formData.coordinators.filter((_, i) => i !== index);
    setFormData({ ...formData, coordinators: updated });
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Person color="secondary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Event Coordinators
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Add coordinators who will be responsible for managing this event
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        {formData.coordinators?.map((coordinator, index) => (
          <Paper
            key={index}
            sx={{
              p: 3,
              mb: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              position: 'relative',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Coordinator {index + 1}
                {index === 0 && (
                  <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                    (Primary)
                  </Typography>
                )}
              </Typography>
              {index > 0 && (
                <IconButton
                  onClick={() => handleRemoveCoordinator(index)}
                  color="error"
                  size="small"
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1)
                    }
                  }}
                >
                  <Delete />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Coordinator Name"
                  value={coordinator.name}
                  onChange={(e) =>
                    handleNestedChange(
                      "coordinators",
                      "name",
                      e.target.value,
                      index
                    )
                  }
                  required
                  disabled={index === 0} // First coordinator is auto-filled
                  placeholder="Enter full name"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={coordinator.designation}
                  onChange={(e) =>
                    handleNestedChange(
                      "coordinators",
                      "designation",
                      e.target.value,
                      index
                    )
                  }
                  required
                  placeholder="e.g., Assistant Professor"
                  InputProps={{
                    startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Department"
                  value={coordinator.department}
                  onChange={(e) =>
                    handleNestedChange(
                      "coordinators",
                      "department",
                      e.target.value,
                      index
                    )
                  }
                  required
                  placeholder="Department name"
                  InputProps={{
                    startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddCoordinator}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderStyle: 'dashed',
            py: 1.5,
            width: '100%',
            '&:hover': {
              borderStyle: 'solid'
            }
          }}
        >
          Add Another Coordinator
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Organizing Departments Section */}
      <Paper
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Business color="info" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Organizing Departments
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Primary Department"
              value={formData.organizingDepartments?.primary || "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)"}
              disabled
              helperText="Primary department is always DCSE"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Note about associative departments */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Associative departments can be added if this event is co-organized with other departments.
            This is optional and can be configured in advanced settings.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CoordinatorsStep;