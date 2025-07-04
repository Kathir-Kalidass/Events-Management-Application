// import React, { useEffect, useState } from "react";

// const tableStyle = {
//   width: '100%',
//   background: 'rgba(20,20,20,0.95)',
//   borderRadius: 6,
//   boxShadow: '0 2px 12px #0006',
//   color: '#fff',
//   marginTop: 24,
//   borderCollapse: 'separate',
//   borderSpacing: 0,
//   overflow: 'hidden',
// };

// const thStyle = {
//   background: 'rgba(0,0,0,0.7)',
//   color: '#fff',
//   fontWeight: 600,
//   padding: '14px 12px',
//   textAlign: 'left',
//   fontSize: 17,
//   borderBottom: '2px solid #333',
// };

// const tdStyle = {
//   padding: '13px 12px',
//   fontSize: 16,
//   borderBottom: '1px solid #222',
//   background: 'rgba(30,30,30,0.85)',
// };

// const rowHover = {
//   transition: 'background 0.2s',
// };

// const participantId = "6857dbb542e87e57a8748a61";

// const MyEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch(`http://localhost:5050/api/participant/my-events/${participantId}`)
//       .then(res => res.json())
//       .then(data => setEvents(data));
//   }, [participantId]);
//     const fetchEvents = async () => {
//       try {
//         const apiResponse = await fetch(`http://localhost:5050/api/participant/my-events/${participantId}`);
//         if (!apiResponse.ok) throw new Error("Failed to fetch events");
//         const data = await apiResponse.json();
//         // For each item, fetch the event name from the events model if not present
//         const eventsWithNames = await Promise.all(data.map(async item => {
//           let name = item.eventId?.name;
//           if (!name && item.eventId?._id) {
//             // Fetch event details from events model
//             const eventRes = await fetch(`http://localhost:5050/api/participant/events`);
//             if (eventRes.ok) {
//               const allEvents = await eventRes.json();
//               const found = allEvents.find(ev => ev._id === item.eventId._id);
//               name = found?.name || found?.title || 'No Name';
//             } else {
//               name = 'No Name';
//             }
//           }
//           return {
//             _id: item.eventId?._id,
//             name,
//             startDate: item.eventId?.startDate,
//             endDate: item.eventId?.endDate,
//             venue: item.eventId?.venue,
//             mode: item.eventId?.mode,
//           };
//         }));
//         setEvents(eventsWithNames);
//       } catch (err) {
//         setError("Failed to fetch events");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEvents();
//   }, []);

//   if (loading) return <div style={{ color: '#fff' }}>Loading events...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;

//   return (
//     <div style={{ width: '100%' }}>
//       <h2 style={{ color: '#fff', margin: '24px 0 16px 0', fontWeight: 600, fontSize: 26, letterSpacing: 1 }}>My Registered Events</h2>
//       <table style={tableStyle}>
//         <thead>
//           <tr>
//             <th style={thStyle}>Event Name</th>
//             <th style={thStyle}>Start Date</th>
//             <th style={thStyle}>End Date</th>
//             <th style={thStyle}>Venue</th>
//             <th style={thStyle}>Mode</th>
//           </tr>
//         </thead>
//         <tbody>
//           {events.length === 0 ? (
//             <tr>
//               <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>No events registered.</td>
//             </tr>
//           ) : (
//             events.map(event => (
//               <tr key={event._id} style={rowHover}>
//                 <td style={tdStyle}>{event.name || event.title || 'No Name'}</td>
//                 <td style={tdStyle}>{event.startDate ? new Date(event.startDate).toLocaleDateString() : ''}</td>
//                 <td style={tdStyle}>{event.endDate ? new Date(event.endDate).toLocaleDateString() : ''}</td>
//                 <td style={tdStyle}>{event.venue}</td>
//                 <td style={tdStyle}>{event.mode}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default MyEvents;

import React, { useEffect, useState } from "react";

const tableStyle = {
  width: '100%',
  background: 'rgba(20,20,20,0.95)',
  borderRadius: 6,
  boxShadow: '0 2px 12px #0006',
  color: '#fff',
  marginTop: 24,
  borderCollapse: 'separate',
  borderSpacing: 0,
  overflow: 'hidden',
};

const thStyle = {
  background: 'rgba(0,0,0,0.7)',
  color: '#fff',
  fontWeight: 600,
  padding: '14px 12px',
  textAlign: 'left',
  fontSize: 17,
  borderBottom: '2px solid #333',
};

const tdStyle = {
  padding: '13px 12px',
  fontSize: 16,
  borderBottom: '1px solid #222',
  background: 'rgba(30,30,30,0.85)',
};

const rowHover = {
  transition: 'background 0.2s',
};

const participantId = "6857dbb542e87e57a8748a61";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiResponse = await fetch(`http://localhost:5050/api/participant/my-events/${participantId}`);
        if (!apiResponse.ok) throw new Error("Failed to fetch events");
        const data = await apiResponse.json();

        // Fetch all events and filter only approved
        const eventRes = await fetch("http://localhost:5050/api/participant/events");
        const allEvents = await eventRes.json();
        const approvedEvents = allEvents.filter(ev => ev.status === "approved");

        const eventsWithNames = await Promise.all(data.map(async item => {
          let eventObj = approvedEvents.find(ev => ev._id === item.eventId?._id);
          if (!eventObj) return null; // skip if not approved
          return {
            _id: item.eventId?._id,
            name: eventObj.name || eventObj.title,
            startDate: eventObj.startDate,
            endDate: eventObj.endDate,
            venue: eventObj.venue,
            mode: eventObj.mode,
          };
        }));

        setEvents(eventsWithNames.filter(Boolean));
      } catch (err) {
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents(); // ✅ Call inside useEffect
  }, []);

  if (loading) return <div style={{ color: '#fff' }}>Loading events...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{
        color: '#fff',
        margin: '24px 0 16px 0',
        fontWeight: 600,
        fontSize: 26,
        letterSpacing: 1
      }}>
        My Registered Events
      </h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Event Name</th>
            <th style={thStyle}>Start Date</th>
            <th style={thStyle}>End Date</th>
            <th style={thStyle}>Venue</th>
            <th style={thStyle}>Mode</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#aaa' }}>
                No events registered.
              </td>
            </tr>
          ) : (
            events.map(event => (
              <tr key={event._id} style={rowHover}>
                <td style={tdStyle}>{event.name || event.title || 'No Name'}</td>
                <td style={tdStyle}>{event.startDate ? new Date(event.startDate).toLocaleDateString() : ''}</td>
                <td style={tdStyle}>{event.endDate ? new Date(event.endDate).toLocaleDateString() : ''}</td>
                <td style={tdStyle}>{event.venue}</td>
                <td style={tdStyle}>{event.mode}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyEvents;

