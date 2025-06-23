import React, { useState, useEffect } from 'react';
import { Paper, TextField, Button, Typography, Box, MenuItem } from '@mui/material';
import { submitFeedback } from "./api";

const participantId = "6857dbb542e87e57a8748a61"; // Or get from context/localStorage if needed

const FeedbackForm = ({ myEvents = [] }) => {
  // Remove useLocation and URL param logic
  // Use selectedEvent from dropdown only
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    if (myEvents.length === 1) {
      setSelectedEvent(myEvents[0].eventId?._id || myEvents[0]._id);
    }
  }, [myEvents]);

  const [feedback, setFeedback] = useState({
    rating: '',
    comments: '',
  });

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  const canSubmit = selectedEvent && participantId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !participantId) {
      alert('Missing event or participant information.');
      return;
    }

    // Find the event object in myEvents
    const eventObj = myEvents.find(ev =>
      (ev.eventId?._id || ev._id) === selectedEvent
    );
    const eventIdToSend = eventObj?.eventId?._id || eventObj?._id;

    if (!eventIdToSend) {
      alert('Invalid event selection.');
      return;
    }

    try {
      const data = await submitFeedback({
        eventId: eventIdToSend,
        participantId,
        ...feedback
      });
      alert("Feedback submitted!");
      setFeedback({ rating: '', comments: '' });
      setSelectedEvent('');
      console.log(data);
    } catch (err) {
      alert("Failed to submit feedback: " + (err.message || 'Unknown error'));
      console.error(err);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>Feedback Form</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          select
          label="Select Event"
          value={selectedEvent}
          onChange={handleEventChange}
          fullWidth
          sx={{ mb: 2 }}
          required
        >
          {myEvents.length === 0 && <MenuItem value="">No events found</MenuItem>}
          {myEvents.map(ev => (
            <MenuItem key={ev.eventId?._id || ev._id} value={ev.eventId?._id || ev._id}>
              {ev.eventId?.name || ev.eventId?.title || ev.name || ev.title || 'Event'}
            </MenuItem>
          ))}
        </TextField>
        <TextField name="rating" label="Rating (1–5)" type="number" fullWidth sx={{ mb: 2 }} value={feedback.rating} onChange={handleChange} required />
        <TextField name="comments" label="Comments" fullWidth multiline rows={4} sx={{ mb: 2 }} value={feedback.comments} onChange={handleChange} required />
        <Button variant="contained" color="primary" type="submit" disabled={!canSubmit}>Submit Feedback</Button>
      </Box>
    </Paper>
  );
};

export default FeedbackForm;
