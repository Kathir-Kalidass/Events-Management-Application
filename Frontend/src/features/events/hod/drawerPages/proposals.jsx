import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { eventState } from "../../../../shared/context/eventProvider";
import EventOverviewCard from "../utils/eventOverviewCard";
const Proposals = ({activePage, setActivePage}) => {

  const {user, events, setEvents} = eventState();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          margin: 2,
          boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
          p: 3,
          bgcolor: "rgb(238, 240, 241)",
          mb:0
        }}
      >
        <Typography
          sx={{
            color: "rgb(88, 90, 91)",
            width:{
              xs:200,
              sm:250,
              md:300,
              lg:350,
            },
            mr:1,
          }}
        >
          Proposal Details
        </Typography>
        
        <Typography
          sx={{
            color: "rgb(88, 90, 91)",
            width:{
              xs:200,
              sm:250,
              md:300,
              lg:350,
            },
            mr:1,
          }}
        >
          Coordinator
        </Typography>
        <Typography
          sx={{
            color: "rgb(88, 90, 91)",
            width:{
              xs:200,
              sm:250,
              md:300,
              lg:350,
            },
            mr:1,
          }}
        >
          Event Date
        </Typography>
        <Typography
          sx={{
            color: "rgb(88, 90, 91)",
            width:{
              xs:200,
              sm:250,
              md:300,
              lg:350,
            },
            mr:1,
          }}
        >
          Budget
        </Typography>
        <Typography
          sx={{
            color: "rgb(88, 90, 91)",
            width:{
              xs:200,
              sm:250,
              md:300,
              lg:350,
            },
            mr:1,
          }}
        >
          Status
        </Typography>
        <Typography
          sx={{
            color: "rgb(88, 90, 91)",
            width:{
              xs:200,
              sm:250,
              md:300,
              lg:350,
            },
            mr:1,
          }}
        >
          Actions
        </Typography>
      </Box>
      
        <Box
          sx={{
            ml:2,
            display:"flex",
            flexDirection:"column"
          }}>
          {
            events.map(event => (
            <EventOverviewCard 
              key={event._id}
              event={event}
              activePage={activePage}
              setActivePage={setActivePage}
            >
            </EventOverviewCard>
          ))
          }
        </Box>

    </Box>
  );
};

export default Proposals;
