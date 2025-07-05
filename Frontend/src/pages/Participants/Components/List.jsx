// import React, { useEffect, useState } from 'react';
// import {
//   Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Typography, Button
// } from '@mui/material';
// import { getAllEvents } from './api';
// import { useNavigate, useLocation } from 'react-router-dom';

// const PList = () => {
//   const [events, setEvents] = useState([]);
//   const navigate = useNavigate();
//   // const location = useLocation();
//   // const params = new URLSearchParams(location.search);
//   // const eventId = params.get('eventId');

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const res = await fetch('http://localhost:5050/api/participants/events');
//         const data = await res.json();
//         const data = await getAllEvents();
//         setEvents(data);
//       } catch (error) {
//         console.error('Error fetching events:', error);
//       }
//     };

//     fetchEvents();
//   }, []);

//   const handleRegister = (eventId) => {
//     navigate(`/participant/register?eventId=${eventId}`);
//   };

//   return (
//     <div>
//       <Typography variant="h5" gutterBottom>
//         Upcoming Events
//       </Typography>
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell><strong>Title</strong></TableCell>
//               <TableCell><strong>Start Date</strong></TableCell>
//               <TableCell><strong>End Date</strong></TableCell>
//               <TableCell><strong>Venue</strong></TableCell>
//               <TableCell><strong>Mode</strong></TableCell>
//               <TableCell><strong>Action</strong></TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {events.map((event) => (
//               <TableRow key={event._id}>
//                 <TableCell>{event.title}</TableCell>
//                 <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
//                 <TableCell>{new Date(event.endDate).toLocaleDateString()}</TableCell>
//                 <TableCell>{event.venue}</TableCell>
//                 <TableCell>{event.mode}</TableCell>
//                 <TableCell>
//                   <Button
//                     variant="outlined"
//                     color="primary"
//                     onClick={() => handleRegister(event._id)}
//                   >
//                     Register
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </div>
//   );
// };

// export default PList;

import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Button
} from '@mui/material';
import { getAllEvents } from './api';
import { useNavigate } from 'react-router-dom';

const PList = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents(); // ✅ Only use this
        const approvedEvents = data.filter(ev => ev.status === "approved");
        setEvents(approvedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleRegister = (eventId) => {
    navigate(`/participant/register?eventId=${eventId}`);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Upcoming Events
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Venue</strong></TableCell>
              <TableCell><strong>Mode</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(event.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{event.venue}</TableCell>
                <TableCell>{event.mode}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleRegister(event._id)}
                  >
                    Register
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PList;
