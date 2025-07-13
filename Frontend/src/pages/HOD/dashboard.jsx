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
import ConvenorCommitteeManagement from "./Components/ConvenorCommitteeManagement";

export const SelectedEventContext = createContext();

const HodDashboard = () => {
  const [activePage, setActivePage] = useState("overview");
  const [selectedEvent, setSelectedEvent] = useState("");
  const { user, events, setEvents } = eventState();
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  function fetchAllEvents() {
    const token = localStorage.getItem("token");
    console.log("🔄 Fetching all events for HOD dashboard...");

    try {
      fetch("http://localhost:5050/api/hod/allEvents/", {
        method: "GET",
        headers:{
          "Authorization": `Bearer ${token}`,
          "Content-Type" : "application/json",
        },
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            alert('Your session has expired. Please log in again.');
            window.location.href = '/';
            return;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            console.log("✅ Events fetched successfully:", data.length, "events");
            console.log("Sample event budget data:", data[0]?.budgetBreakdown);
            setEvents(data);
            setLastRefresh(Date.now());
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching events:", error);
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  // Manual refresh function
  const handleRefreshData = () => {
    fetchAllEvents();
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Auto-refresh every 30 seconds when user is on finance page
  useEffect(() => {
    let interval;
    if (activePage === "finance" || activePage === "finalBudget") {
      interval = setInterval(() => {
        console.log("Auto-refreshing data for finance page...");
        fetchAllEvents();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activePage]);

  return (
    <SelectedEventContext.Provider value={{ selectedEvent, setSelectedEvent }}>
      <Box>
        <NavbarHod
          activePage={activePage}
          setActivePage={setActivePage}
          onRefresh={handleRefreshData}
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
            <Finance 
              activePage={activePage} 
              setActivePage={setActivePage} 
              lastRefresh={lastRefresh}
            />
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

          {activePage === "convenorCommittee" && (
            <ConvenorCommitteeManagement />
          )}
        </Box>
      </Box>
    </SelectedEventContext.Provider>
  );
};

export default HodDashboard;
