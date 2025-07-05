import React, { useEffect, useState } from 'react';
import { getMyEvents } from './api';

const participantId = "6857dbb542e87e57a8748a61";

const MyEventsWrapper = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiResponse = await fetch(`http://localhost:5050/api/participant/my-events/${participantId}`);
        if (!apiResponse.ok) throw new Error("Failed to fetch events");
        const data = await apiResponse.json();
        console.log(data);
        // Map the data to extract event details from eventId
        const mappedEvents = data.map(item => ({
          _id: item.eventId?._id,
          name: item.eventId?.name,
          startDate: item.eventId?.startDate,
          endDate: item.eventId?.endDate,
          venue: item.eventId?.venue,
          mode: item.eventId?.mode,
        }));
        setEvents(mappedEvents);
      } catch (err) {
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div style={{ color: '#fff' }}>Loading events...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ color: '#fff', margin: '24px 0 16px 0', fontWeight: 600, fontSize: 26, letterSpacing: 1 }}>My Registered Events</h2>
      <table style={{
        width: '100%',
        background: 'rgba(20,20,20,0.95)',
        borderRadius: 6,
        boxShadow: '0 2px 12px #0006',
        color: '#fff',
        marginTop: 24,
        borderCollapse: 'separate',
        borderSpacing: 0,
        overflow: 'hidden',
      }}>
        <thead>
          <tr>
            <th style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600, padding: '14px 12px', textAlign: 'left', fontSize: 17, borderBottom: '2px solid #333' }}>Event Name</th>
            <th style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600, padding: '14px 12px', textAlign: 'left', fontSize: 17, borderBottom: '2px solid #333' }}>Start Date</th>
            <th style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600, padding: '14px 12px', textAlign: 'left', fontSize: 17, borderBottom: '2px solid #333' }}>End Date</th>
            <th style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600, padding: '14px 12px', textAlign: 'left', fontSize: 17, borderBottom: '2px solid #333' }}>Venue</th>
            <th style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600, padding: '14px 12px', textAlign: 'left', fontSize: 17, borderBottom: '2px solid #333' }}>Mode</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '13px 12px', fontSize: 16, borderBottom: '1px solid #222', background: 'rgba(30,30,30,0.85)', textAlign: 'center', color: '#aaa' }}>No events registered.</td>
            </tr>
          ) : (
            events.map(event => (
              <tr key={event._id} style={{ transition: 'background 0.2s' }}>
                <td style={{ padding: '13px 12px', fontSize: 16, borderBottom: '1px solid #222', background: 'rgba(30,30,30,0.85)' }}>{event.name}</td>
                <td style={{ padding: '13px 12px', fontSize: 16, borderBottom: '1px solid #222', background: 'rgba(30,30,30,0.85)' }}>{event.startDate ? new Date(event.startDate).toLocaleDateString() : ''}</td>
                <td style={{ padding: '13px 12px', fontSize: 16, borderBottom: '1px solid #222', background: 'rgba(30,30,30,0.85)' }}>{event.endDate ? new Date(event.endDate).toLocaleDateString() : ''}</td>
                <td style={{ padding: '13px 12px', fontSize: 16, borderBottom: '1px solid #222', background: 'rgba(30,30,30,0.85)' }}>{event.venue}</td>
                <td style={{ padding: '13px 12px', fontSize: 16, borderBottom: '1px solid #222', background: 'rgba(30,30,30,0.85)' }}>{event.mode}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyEventsWrapper;
