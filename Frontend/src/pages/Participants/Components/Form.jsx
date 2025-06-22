import React from 'react';
import { Paper, TextField, Button, Typography, Box } from '@mui/material';

const PForm = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Add a New Participant</Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField label="Name" fullWidth sx={{ mb: 1 }} />
        <TextField label="Roll no" fullWidth sx={{ mb: 1 }} />
        <TextField label="Department" fullWidth sx={{ mb: 1 }} />
        <TextField label="Year" fullWidth sx={{ mb: 1 }} />
        <TextField label="Email" fullWidth sx={{ mb: 1 }} />
        <TextField label="Phone Number" fullWidth sx={{ mb: 1 }} />
        <TextField label="Events to Participate " fullWidth sx={{ mb: 1 }} />
        <Button variant="contained" color="primary">Submit</Button>
      </Box>
    </Paper>
  );
};

export default PForm;
