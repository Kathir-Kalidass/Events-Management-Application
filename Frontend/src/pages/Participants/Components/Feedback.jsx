import React, { useState } from 'react';
import { Paper, TextField, Button, Typography, Box } from '@mui/material';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState({
    eventId: '',
    participantId: '',
    rating: '',
    comments: '',
  });

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8080/api/participants/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
    const data = await res.json();
    alert("Feedback submitted!");
    console.log(data);
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>Feedback Form</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField name="eventId" label="Event ID" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
        <TextField name="participantId" label="Participant ID" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
        <TextField name="rating" label="Rating (1–5)" type="number" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
        <TextField name="comments" label="Comments" fullWidth multiline rows={4} sx={{ mb: 2 }} onChange={handleChange} />
        <Button variant="contained" color="primary" type="submit">Submit Feedback</Button>
      </Box>
    </Paper>
  );
};

export default FeedbackForm;
