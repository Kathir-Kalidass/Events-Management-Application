import React, { useState } from 'react';
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
  alpha,
  Collapse,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add,
  Delete,
  Person,
  Business,
  Work,
  ExpandMore,
  ExpandLess,
  Settings
} from '@mui/icons-material';

const CoordinatorsStep = ({ formData, setFormData }) => {
  const theme = useTheme();
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Available departments for associative selection
  const availableDepartments = [
    "DEPARTMENT OF ELECTRONICS AND COMMUNICATION ENGINEERING (DECE)",
    "DEPARTMENT OF ELECTRICAL AND ELECTRONICS ENGINEERING (DEEE)",
    "DEPARTMENT OF MECHANICAL ENGINEERING (DME)",
    "DEPARTMENT OF CIVIL ENGINEERING (DCE)",
    "DEPARTMENT OF CHEMICAL ENGINEERING (DCHE)",
    "DEPARTMENT OF BIOTECHNOLOGY (DBT)",
    "DEPARTMENT OF INFORMATION TECHNOLOGY (DIT)",
    "DEPARTMENT OF MATHEMATICS (DMATH)",
    "DEPARTMENT OF PHYSICS (DPHY)",
    "DEPARTMENT OF CHEMISTRY (DCHEM)",
    "DEPARTMENT OF MANAGEMENT STUDIES (DMS)",
    "CENTRE FOR WATER RESOURCES (CWR)",
    "CENTRE FOR BIOTECHNOLOGY (CBT)",
    "CENTRE FOR ENVIRONMENTAL STUDIES (CES)"
  ];

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

  const handleOrganizingDepartmentsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      organizingDepartments: {
        ...prev.organizingDepartments,
        [field]: value
      }
    }));
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

        {/* Advanced Settings Toggle */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            endIcon={showAdvancedSettings ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderStyle: 'dashed',
              '&:hover': {
                borderStyle: 'solid'
              }
            }}
          >
            Advanced Settings - Associative Departments
          </Button>
        </Box>

        {/* Collapsible Advanced Settings */}
        <Collapse in={showAdvancedSettings}>
          <Box sx={{ mt: 3, p: 3, backgroundColor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
              Co-organizing Departments
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select additional departments that are co-organizing this event. These departments will appear in the event documentation and brochures.
            </Typography>

            <Autocomplete
              multiple
              options={availableDepartments}
              value={formData.organizingDepartments?.associative || []}
              onChange={(event, newValue) => {
                handleOrganizingDepartmentsChange('associative', newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                    sx={{
                      borderRadius: 2,
                      '& .MuiChip-deleteIcon': {
                        color: 'warning.main'
                      }
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Associative Departments"
                  placeholder="Choose departments..."
                  helperText="Select departments that are co-organizing this event"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              )}
              sx={{ mb: 2 }}
            />

            {/* Display selected associative departments */}
            {formData.organizingDepartments?.associative?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Selected Co-organizing Departments:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.organizingDepartments.associative.map((dept, index) => (
                    <Chip
                      key={index}
                      label={dept}
                      color="primary"
                      variant="filled"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Information about co-organizing */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>💡 Tip:</strong> Co-organizing departments will be displayed in:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Event brochures and promotional materials
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Official event documentation
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Approval workflows (if required)
                </Typography>
              </Box>
            </Box>
          </Box>
        </Collapse>

        {/* Note about associative departments */}
        {!showAdvancedSettings && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Associative departments can be added if this event is co-organized with other departments.
              This is optional and can be configured in advanced settings.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CoordinatorsStep;