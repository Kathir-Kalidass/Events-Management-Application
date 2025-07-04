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

  // Fetch event details for display
  const [eventDetails, setEventDetails] = React.useState(null);
  React.useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/participant/events`);
        const allEvents = await res.json();
        const found = allEvents.find(ev => ev._id === eventId);
        setEventDetails(found);
      } catch (err) {
        setEventDetails(null);
      }
    };
    fetchEvent();
  }, [eventId]);

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
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Roboto, Arial, sans-serif', // Match dashboard font
      color: '#fff', // Ensure all text is white
    }}>
      {/* Blurred background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url(/Anna_University.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          zIndex: 0,
        }}
      />
      {/* Foreground content */}
      <Paper sx={{
        p: 5,
        minWidth: 400,
        maxWidth: 500,
        boxShadow: 6,
        zIndex: 1,
        position: 'relative',
        bgcolor: '#232323',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 5,
        fontFamily: 'Roboto, Arial, sans-serif', // Match dashboard font
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#fff', textAlign: 'center', fontFamily: 'inherit', fontSize: '2.1rem' }}>
          Register for Event
        </Typography>
        {eventDetails && (
          <Box sx={{ mb: 3, width: '100%', textAlign: 'center' }}>
            <Typography sx={{ color: '#fff', fontSize: '1.15rem', mb: 1, fontWeight: 500, fontFamily: 'inherit' }}><b>Event Name:</b> {eventDetails.title || eventDetails.name}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}><b>Start Date:</b> {eventDetails.startDate ? new Date(eventDetails.startDate).toLocaleDateString() : '-'}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}><b>End Date:</b> {eventDetails.endDate ? new Date(eventDetails.endDate).toLocaleDateString() : '-'}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}><b>Venue:</b> {eventDetails.venue}</Typography>
            <Typography sx={{ color: '#fff', fontSize: '1.05rem', mb: 1, fontWeight: 400, fontFamily: 'inherit' }}><b>Mode:</b> {eventDetails.mode}</Typography>
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ width: '100%', textAlign: 'center' }}>
          <Typography sx={{ mb: 3, color: '#fff', fontSize: '1.05rem', fontWeight: 400, fontFamily: 'inherit' }}>Are you sure you want to register for this event?</Typography>
          <Button 
            variant="contained" 
            type="submit"
            sx={{
              bgcolor: '#232323', // match table bg
              color: '#fff', // match table text color
              border: '1.5px solid #fff',
              fontSize: '1rem',
              px: 3,
              py: 1.2,
              fontWeight: 500,
              fontFamily: 'inherit',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#333', boxShadow: 'none' }
            }}
          >
            REGISTER
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PForm;
