import React from 'react';
import { Paper, Button, Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { registerEvent } from './api';

const PForm = ({ user }) => {
  // Get eventId from query string
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const eventId = params.get('eventId');

  // Assume user._id is available from context or props
  const participantId = "6857dbb542e87e57a8748a61"; // Replace with actual user ID

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!participantId || !eventId) {
      alert('Missing participant or event information.');
      return;
    }
    try {
      await registerEvent({ participantId, eventId });
      alert('Registration successful!');
    } catch (err) {
      alert('Registration failed or already registered.');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Register for Event</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <Typography sx={{ mb: 2 }}>Are you sure you want to register for this event?</Typography>
        <Button variant="contained" color="primary" type="submit">Confirm Registration</Button>
      </Box>
    </Paper>
  );
};

export default PForm;
