import { useState } from "react";
import { eventState } from "../../../../context/eventProvider";
import { Box } from "@mui/material";
import FinanceHeader from "./financeHeader";
import FinancialEventCard from "./financeEventCard";
import { useEffect } from "react";

const Finance = ({activePage, setActivePage, lastRefresh}) => {

  const {user, events, setEvents} = eventState();
  const [completedEvents, setCompletedEvents] = useState([]);

  return (
    <Box
      sx={{
        marginTop: "10px",
      }}
    >
      <Box sx={{
        mb:1.5,
      }}>
        <FinanceHeader lastRefresh={lastRefresh} />
      </Box>

      <Box sx={{
        display:"grid",
        gridTemplateColumns:{
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
            lg: "1fr 1fr 1fr 1fr"
        }

      }}>

        {
          events.map(event =>(
            <FinancialEventCard
              key={event._id}
              event={event}
              activePage={activePage}
              setActivePage={setActivePage}
            >
            </FinancialEventCard>
          ))
        }     
        
      </Box>
    </Box>
  );
};

export default Finance;

/* 
<FinancialEventCard
          event={{
            title: "Annual Conference",
            budget: 75050,
            income: 68000,
            expenses: 72000,
          }}
        />
*/