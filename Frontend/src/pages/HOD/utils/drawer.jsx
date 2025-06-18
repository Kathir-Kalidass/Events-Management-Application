import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

export default function TemporaryDrawer({
  open,
  onClose,
  activePage,
  setActivePage,
}) {

  const navigate = useNavigate();

  function handleOverview() {
    setActivePage("overview");
    onClose();
  }

  function handleProposal() {
    setActivePage("proposal");
    onClose();
  }

  function handleApproved() {
    setActivePage("approved");
    onClose();
  }

  function handlePendingProposals(){
    setActivePage("pendingProposal");
    onClose();
  }

  function handleFinance(){
    setActivePage("finance");
    onClose();
  }

  function handleLogOut() {
    onClose();
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    navigate("/");
  }

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box display="flex" justifyContent="end" margin="4px 4px">
        <IconButton onClick={onClose}>
          <CloseIcon></CloseIcon>
        </IconButton>
      </Box>

      <List sx={{ width: 250 }}>
        <ListItem
          button
          onClick={handleOverview}
          sx={{ margin: "4px", cursor: "pointer" }}
        >
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem
          sx={{ margin: "4px", cursor: "pointer" }}
          button
          onClick={handleProposal}
        >
          <ListItemText primary="Proposal Management" />
        </ListItem>

        <ListItem
          sx={{ margin: "4px", cursor: "pointer" }}
          button
          onClick={handleApproved}
        >
          <ListItemText primary="Approved Events" />
        </ListItem>

        <ListItem
          sx={{ margin: "4px", cursor: "pointer" }}
          button
          onClick={handlePendingProposals}
        >
          <ListItemText primary="Pending Proposals" />
        </ListItem>

        <ListItem
          sx={{ margin: "4px", cursor: "pointer" }}
          button
          onClick={handleFinance}
        >
          <ListItemText primary="Finance View" />
        </ListItem>

        <ListItem
          sx={{ margin: "4px", cursor: "pointer" }}
          button
          onClick={handleLogOut}
        >
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
}
