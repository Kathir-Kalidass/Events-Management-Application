import { useState, useEffect, createContext } from "react";
import NavbarHod from "./utils/navbar";
import Overview from "./drawerPages/overview/overview";
import Proposals from "./drawerPages/proposals";
import ApprovedEvents from "./drawerPages/approvedEvents";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { eventState } from "../../context/eventProvider";
import PendingProposals from "./drawerPages/pendingProposals";
import Finance from "./drawerPages/Finance/Finance";
import FinalBudget from "./drawerPages/Finance/finalBudget";
import ProposalLetter from "./utils/proposalLetter";

export const SelectedEventContext = createContext();

const HodDashboard = () => {
  const [activePage, setActivePage] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState("");
  const { user, events, setEvents } = eventState();

  function fetchAllEvents() {
    const token = localStorage.getItem("token");

    try {
      fetch("http://localhost:5050/api/hod/allEvents/", {
        method: "GET",
        /*  headers:{
          "authorization": `Bearer ${token}`,
          "Content-Type" : "application/json",
        }, */
      })
        .then((res) => res.json())
        .then((data) => {
          setEvents(data);
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    fetchAllEvents();
  }, []);

  return (
    <SelectedEventContext.Provider value={{ selectedEvent, setSelectedEvent }}>
      <Box>
        <NavbarHod
          activePage={activePage}
          setActivePage={setActivePage}
        ></NavbarHod>
        <Box>
          {activePage === "overview" && (
            <Overview
              activePage={activePage}
              setActivePage={setActivePage}
            ></Overview>
          )}
          {activePage === "proposal" && (
            <Proposals activePage={activePage} setActivePage={setActivePage} />
          )}
          {activePage === "approved" && <ApprovedEvents />}
          {activePage === "pendingProposal" && <PendingProposals />}
          {activePage === "finance" && (
            <Finance activePage={activePage} setActivePage={setActivePage} />
          )}
          {activePage === "finalBudget" && (
            <FinalBudget
              activePage={activePage}
              setActivePage={setActivePage}
            />
          )}

          {activePage === "proposalLetterView" && (
            <ProposalLetter
              activePage={activePage}
              setActivePage={setActivePage}
            />
          )}
        </Box>
      </Box>
    </SelectedEventContext.Provider>
  );
};

export default HodDashboard;
