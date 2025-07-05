import React, { useEffect, useState } from "react";
import { getMyEvents } from "./api";
import MyEvents from "./Myevents";

const participantId = "6857dbb542e87e57a8748a61"; // TODO: Get this from auth/user context

const MyEventsContainer = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getMyEvents(participantId);
        setEvents(data);
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

  return <MyEvents events={events} />;
};

export default MyEventsContainer;
