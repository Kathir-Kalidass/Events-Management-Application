import React, { useState, useEffect } from 'react';
import { Paper, TextField, Button, Typography, Box, MenuItem, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import Rating from '@mui/material/Rating';

const participantId = "6857dbb542e87e57a8748a61"; // Or get from context/localStorage if needed

const designationOptions = [
  'UG Student',
  'PG Student',
  'Research Scholar',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Other',
];

const FeedbackForm = ({ myEvents = [] }) => {
  // Remove useLocation and URL param logic
  // Use selectedEvent from dropdown only
  const [selectedEvent, setSelectedEvent] = useState('');

  useEffect(() => {
    if (myEvents.length === 1) {
      setSelectedEvent(myEvents[0].eventId?._id || myEvents[0]._id);
    }
  }, [myEvents]);

  const [form, setForm] = useState({
    email: '',
    name: '',
    designation: '',
    institute: '',
    contact: '',
    q7: 0,
    q8: 0,
    q9: 0,
    q10: 0,
    q11: 0,
    q12: '',
    q13: 0,
    q14: '',
    q15: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  const canSubmit = selectedEvent && participantId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Include eventId and participantId in the request body
    const payload = {
      ...form,
      eventId: selectedEvent,
      participantId: participantId,
    };
    try {
      const res = await fetch("http://localhost:5050/api/participant/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        // Show backend error message if available
        alert(data.message || "Error submitting feedback.");
        return;
      }
      alert("Feedback submitted!");
      console.log(data);
    } catch (err) {
      alert("Network error. Please try again later.");
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Feedback Form</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          select
          label="Select Event"
          value={selectedEvent}
          onChange={handleEventChange}
          fullWidth
          sx={{ mb: 3 }}
          required
        >
          {myEvents.length === 0 && <MenuItem value="">No events found</MenuItem>}
          {myEvents.map(ev => (
            <MenuItem key={ev.eventId?._id || ev._id} value={ev.eventId?._id || ev._id}>
              {ev.eventId?.name || ev.eventId?.title || ev.name || ev.title || 'Event'}
            </MenuItem>
          ))}
        </TextField>
        <TextField name="email" label="Email" fullWidth sx={{ mb: 3 }} value={form.email} onChange={handleChange} required />
        <TextField name="name" label="Name (with Salutation and Initial)" fullWidth sx={{ mb: 3 }} value={form.name} onChange={handleChange} required />
        <TextField select name="designation" label="Designation" fullWidth sx={{ mb: 3 }} value={form.designation} onChange={handleChange} required>
          {designationOptions.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
        <TextField name="institute" label="Name of the Institute" fullWidth sx={{ mb: 3 }} value={form.institute} onChange={handleChange} required />
        <TextField name="contact" label="Contact Number" fullWidth sx={{ mb: 3 }} value={form.contact} onChange={handleChange} required />
        <Typography sx={{ mt: 3, mb: 2, fontWeight: 600 }}>Feedback about the sessions (1-5 stars)</Typography>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>How effectively do you think the organization of this training programme facilitated a conducive learning environment and promoted active participation among participants?</Typography>
          <Rating name="q7" value={Number(form.q7)} onChange={(_, v) => handleRatingChange('q7', v)} max={5} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>How effectively did the resource persons communicate and engage with the participants to enhance their learning experience?</Typography>
          <Rating name="q8" value={Number(form.q8)} onChange={(_, v) => handleRatingChange('q8', v)} max={5} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>How well do you think the topics covered align with the current trends and challenges, and to what extent did they contribute to your professional development?</Typography>
          <Rating name="q9" value={Number(form.q9)} onChange={(_, v) => handleRatingChange('q9', v)} max={5} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>How effective was the presentation style in conveying the key concepts and fostering a dynamic learning environment for the participants?</Typography>
          <Rating name="q10" value={Number(form.q10)} onChange={(_, v) => handleRatingChange('q10', v)} max={5} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>Please provide an overall assessment of the program's overall effectiveness</Typography>
          <Rating name="q11" value={Number(form.q11)} onChange={(_, v) => handleRatingChange('q11', v)} max={5} />
        </Box>
        <TextField name="q12" label="How do you think the training programme could have been more effective? (In 2 lines)" fullWidth multiline rows={2} sx={{ mb: 3 }} value={form.q12} onChange={handleChange} required />
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>How satisfied were you overall? (1-5 stars)</Typography>
          <Rating name="q13" value={Number(form.q13)} onChange={(_, v) => handleRatingChange('q13', v)} max={5} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1 }}>Would you recommend the workshop to your colleagues or peers?</Typography>
          <RadioGroup row name="q14" value={form.q14} onChange={handleChange}>
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </Box>
        <TextField name="q15" label="Which topics or aspects of the sessions did you find most interesting or useful?" fullWidth multiline rows={2} sx={{ mb: 3 }} value={form.q15} onChange={handleChange} required />
        <Button variant="contained" color="primary" type="submit" disabled={!canSubmit}>Submit Feedback</Button>
      </Box>
    </Paper>
  );
};

export default FeedbackForm;
