import React from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  Group,
  Person,
  Add,
  School
} from '@mui/icons-material';

const ParticipantsStep = ({ 
  formData, 
  setFormData, 
  newTargetAudience, 
  setNewTargetAudience,
  newResourcePerson,
  setNewResourcePerson 
}) => {
  const theme = useTheme();

  const handleAddTargetAudience = () => {
    if (newTargetAudience?.trim()) {
      setFormData({
        ...formData,
        targetAudience: [
          ...formData.targetAudience,
          newTargetAudience.trim(),
        ],
      });
      setNewTargetAudience("");
    }
  };

  const handleRemoveTargetAudience = (index) => {
    const newAudience = formData.targetAudience.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      targetAudience: newAudience,
    });
  };

  const handleAddResourcePerson = () => {
    if (newResourcePerson?.trim()) {
      setFormData({
        ...formData,
        resourcePersons: [
          ...formData.resourcePersons,
          newResourcePerson.trim(),
        ],
      });
      setNewResourcePerson("");
    }
  };

  const handleRemoveResourcePerson = (index) => {
    const newPersons = formData.resourcePersons.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      resourcePersons: newPersons,
    });
  };

  const handleKeyPress = (e, handler) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  };

  const suggestedAudiences = [
    "UG Students",
    "PG Students", 
    "Faculty Members",
    "Research Scholars",
    "Industry Professionals",
    "PhD Scholars",
    "Alumni",
    "External Participants"
  ];

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
          <Group color="success" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Participants & Resource Persons
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Define who can participate in this event and who will be the resource persons
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Target Audience Section */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Group color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Target Audience *
              </Typography>
            </Box>

            {/* Current Target Audience */}
            <Box sx={{ mb: 3 }}>
              {formData.targetAudience?.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.targetAudience.map((audience, index) => (
                    <Chip
                      key={index}
                      label={audience}
                      onDelete={() => handleRemoveTargetAudience(index)}
                      color="primary"
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        '& .MuiChip-deleteIcon': {
                          '&:hover': {
                            color: theme.palette.error.main
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No target audience added yet. Please add at least one.
                </Typography>
              )}
            </Box>

            {/* Add Target Audience */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="Add Target Audience"
                value={newTargetAudience || ""}
                onChange={(e) => setNewTargetAudience(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddTargetAudience)}
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                placeholder="e.g., UG Students, Faculty Members"
              />
              <Button
                variant="contained"
                onClick={handleAddTargetAudience}
                disabled={!newTargetAudience?.trim()}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none'
                }}
              >
                Add
              </Button>
            </Box>

            {/* Suggested Audiences */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Quick add suggestions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedAudiences
                  .filter(suggestion => !formData.targetAudience?.includes(suggestion))
                  .map((suggestion) => (
                    <Chip
                      key={suggestion}
                      label={suggestion}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => {
                        setFormData({
                          ...formData,
                          targetAudience: [...formData.targetAudience, suggestion]
                        });
                      }}
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    />
                  ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Resource Persons Section */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <School color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Resource Persons
              </Typography>
            </Box>

            {/* Current Resource Persons */}
            <Box sx={{ mb: 3 }}>
              {formData.resourcePersons?.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.resourcePersons.map((person, index) => (
                    <Chip
                      key={index}
                      label={person}
                      onDelete={() => handleRemoveResourcePerson(index)}
                      color="secondary"
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        '& .MuiChip-deleteIcon': {
                          '&:hover': {
                            color: theme.palette.error.main
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No resource persons added yet. This is optional.
                </Typography>
              )}
            </Box>

            {/* Add Resource Person */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="Add Resource Person"
                value={newResourcePerson || ""}
                onChange={(e) => setNewResourcePerson(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleAddResourcePerson)}
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
                placeholder="e.g., Dr. John Smith (IIT Delhi)"
              />
              <Button
                variant="outlined"
                onClick={handleAddResourcePerson}
                disabled={!newResourcePerson?.trim()}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  textTransform: 'none'
                }}
              >
                Add
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Examples: Dr. John Smith (IIT Delhi), Prof. Jane Doe (Industry Expert), Mr. Alex Kumar (Google)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParticipantsStep;