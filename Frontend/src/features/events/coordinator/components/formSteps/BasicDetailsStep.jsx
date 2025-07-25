import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { DatePicker } from "@mui/x-date-pickers";
import {
  Event,
  LocationOn,
  Schedule,
  Category,
  MonetizationOn,
  Flag,
  TrendingUp
} from '@mui/icons-material';

const BasicDetailsStep = ({ formData, setFormData }) => {
  const theme = useTheme();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Event color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Basic Event Information
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Provide the fundamental details about your event
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Event Title */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter a descriptive event title"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>

        {/* Event Type */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Event Type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            placeholder="e.g., Workshop, Seminar, Conference"
            InputProps={{
              startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>

        {/* Venue */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Venue"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            required
            placeholder="Enter the event venue or location"
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Start Date"
            value={formData.startDate}
            onChange={(date) => handleDateChange("startDate", date)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required 
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} md={6}>
          <DatePicker
            label="End Date"
            value={formData.endDate}
            onChange={(date) => handleDateChange("endDate", date)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required 
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Mode */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Event Mode</InputLabel>
            <Select
              name="mode"
              value={formData.mode}
              label="Event Mode"
              onChange={handleInputChange}
              sx={{
                borderRadius: 2
              }}
            >
              <MenuItem value="Online">🌐 Online</MenuItem>
              <MenuItem value="Offline">🏢 Offline</MenuItem>
              <MenuItem value="Hybrid">🔄 Hybrid</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Duration */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
            placeholder="e.g., 2 days, 4 hours"
            InputProps={{
              startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>

        {/* Budget */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Budget (₹)"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleInputChange}
            required
            placeholder="Enter estimated budget"
            InputProps={{
              startAdornment: <MonetizationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>

        {/* Objectives */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Objectives"
            name="objectives"
            value={formData.objectives}
            onChange={handleInputChange}
            multiline
            rows={4}
            required
            placeholder="Describe the main objectives of this event"
            InputProps={{
              startAdornment: <Flag sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>

        {/* Outcomes */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Expected Outcomes"
            name="outcomes"
            value={formData.outcomes}
            onChange={handleInputChange}
            multiline
            rows={4}
            required
            placeholder="Describe the expected outcomes and benefits"
            InputProps={{
              startAdornment: <TrendingUp sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicDetailsStep;