import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { eventState } from "../../../context/eventProvider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getDate } from "./getDate";
import { getCurrency } from "./getCurrency";
import Button from "@mui/material/Button";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";
import DownloadIcon from "@mui/icons-material/Download";
import ViewContentModal from "./viewContentModal";
import CommentModal from "./commentModal";
import DownloadPDF from "./downloadEventDetails";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { SelectedEventContext } from "../dashboard";
import { generateEventBrochure } from "../../../services/brochureGenerator";
import { useSnackbar } from "notistack";

const EventOverviewCard = ({ event, activePage, setActivePage }) => {
  const { selectedEvent, setSelectedEvent } = useContext(SelectedEventContext);
  const { user, events, setEvents } = eventState();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => setOpen(false);
  const handleCommentOpen = () => setCommentOpen(true);
  const handleCommentClose = () => setCommentOpen(false);

  // Download professional brochure
  const downloadBrochure = async () => {
    try {
      // Generate the styled brochure using the frontend generator
      const doc = await generateEventBrochure(event);
      
      // Save as PDF blob and download
      const pdfBlob = doc.output('blob');
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'event'}_brochure.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      enqueueSnackbar("Professional brochure downloaded successfully!", { 
        variant: "success" 
      });
      
    } catch (error) {
      console.error("Error generating brochure:", error);
      enqueueSnackbar("Failed to generate brochure. Please try again.", { 
        variant: "error" 
      });
    }
  };

  function handleOpen() {
    setOpen(true);
  }

  function handleProposalLetterView() {
    setActivePage("proposalLetterView");
    setSelectedEvent(event);
  }

  function updatePendingEvents() {
    console.log("set pending");
  }

  function approveEvent(id) {
    console.log(`approve ${id}`);
    setLoading(true);

    const token = localStorage.getItem("token");
    fetch("http://localhost:5050/api/hod/event/approve", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId: id, reviewedBy: user._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setEvents((preEvents) =>
          preEvents.map((item) => (item._id === data._id ? data : item))
        );
        updatePendingEvents();
      })
      .catch((error) => {
        console.log(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function rejectEvent(id) {
    console.log(`reject ${id}`);
    const token = localStorage.getItem("token");
    setLoading(true);

    fetch("http://localhost:5050/api/hod/event/reject", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId: id, reviewedBy: user._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setEvents((preEvents) =>
          preEvents.map((item) => (item._id === data._id ? data : item))
        );
        updatePendingEvents();
      })
      .catch((error) => {
        console.log(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const eventData = {
    eventName: "Annual Tech Fest",
    date: "2025-06-15",
    organizer: "Dept. of CSE",
    venue: "Main Auditorium",
    description: "A grand event showcasing student innovations.",
  };

  return (
    <Box
      sx={{
        display: "flex",
        borderRadius: "2px",
        justifyContent: "space-between",
        borderColor: "black",
        p: 3,
        mr: 2,
        bgcolor: "rgb(249, 249, 249)",
        boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Box
        sx={{
          width: {
            xs: 200,
            sm: 200,
            md: 350,
            lg: 400,
          },
          mr: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: "500",
              fontSize: 16,
              mb: 1,
              textOverflow: "true",
            }}
          >
            {event.title.toUpperCase()}
          </Typography>
          <Typography>{getDate(event.startDate)}</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: {
            xs: 200,
            sm: 200,
            md: 350,
            lg: 400,
          },
          mr: 1,
        }}
      >
        <Box>
          <Typography sx={{}}>{event.createdBy?.name || 'Unknown'}</Typography>
          <Typography
            sx={{
              color: "grey",
              fontSize: "14px",
            }}
          >
            {event.createdBy?.email || 'No email'}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: {
            xs: 200,
            sm: 200,
            md: 350,
            lg: 400,
          },
          mr: 1,
        }}
      >
        <Box>
          <Typography>{getDate(event.startDate)}</Typography>
          <Typography
            sx={{
              color: "grey",
              fontSize: "14px",
            }}
          >
            {event.venue}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: {
            xs: 200,
            sm: 200,
            md: 350,
            lg: 400,
          },
          mr: 1,
        }}
      >
        <Box>
          <Typography>{getCurrency(event.budget)}</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: {
            xs: 200,
            sm: 200,
            md: 350,
            lg: 400,
          },
          mr: 1,
        }}
      >
        <Box>
          {event.status === "approved" && (
            <Button
              sx={{
                color: "rgb(31, 126, 5)",
                bgcolor: "rgb(178, 231, 163)",
                width: "18px",
                height: "18px",
                fontSize: "10px",
                fontWeight: "bold",
                borderRadius: "10px",
                pt: 1,
                textTransform: "none",
              }}
            >
              Approved
            </Button>
          )}
          {event.status === "rejected" && (
            <Button
              sx={{
                color: "rgb(126, 5, 5)",
                bgcolor: "rgb(225, 184, 184)",
                width: "18px",
                height: "18px",
                fontSize: "10px",
                fontWeight: "bold",
                borderRadius: "10px",
                pt: 1,
                textTransform: "none",
              }}
            >
              Rejected
            </Button>
          )}
          {event.status === "pending" && (
            <Box sx={{}}>
              <Button
                loading={loading}
                sx={{
                  color: "rgb(126, 98, 5)",
                  bgcolor: "rgb(225, 205, 184)",
                  width: "18px",
                  height: "18px",
                  fontSize: "10px",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  pt: 1,
                  textTransform: "none",
                }}
              >
                Pending
              </Button>

              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/hod/event/${event._id}`)}
                  sx={{ mr: 1, mb: 1 }}
                >
                  View Details
                </Button>
                <IconButton onClick={() => approveEvent(event._id)}>
                  <CheckCircleOutlineIcon
                    sx={{
                      color: "green",
                    }}
                  ></CheckCircleOutlineIcon>
                </IconButton>
                <IconButton onClick={() => rejectEvent(event._id)}>
                  <HighlightOffIcon
                    sx={{
                      color: "rgb(185, 20, 11)",
                    }}
                  ></HighlightOffIcon>
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          width: {
            xs: 200,
            sm: 200,
            md: 350,
            lg: 400,
          },
          mr: 1,
        }}
      >
        <Box>
          {event.status === "approved" && (
            <Box sx={{}}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/hod/event/${event._id}`)}
                sx={{ mr: 1, mb: 1 }}
              >
                View Details
              </Button>
              <IconButton onClick={handleOpen}>
                <RemoveRedEyeIcon
                  sx={{
                    color: "rgb(137, 144, 222)",
                  }}
                ></RemoveRedEyeIcon>
              </IconButton>

              <IconButton onClick={handleCommentOpen}>
                <CommentIcon
                  sx={{
                    color: "rgb(182, 182, 187)",
                  }}
                ></CommentIcon>
              </IconButton>

              {activePage == 'proposal' && (
                  <Button
                    variant="contained"
                    sx={{
                      padding: 0,
                      textTransform: "none",
                    }}
                    onClick={handleProposalLetterView}
                  >
                    proposal
                  </Button>
                )}

              <IconButton onClick={downloadBrochure} title="Download Professional Brochure">
                <DownloadIcon
                  sx={{
                    color: "rgb(25, 118, 210)",
                  }}
                ></DownloadIcon>
              </IconButton>

              <ViewContentModal
                event={event}
                open={open}
                handleClose={handleClose}
              ></ViewContentModal>

              <CommentModal
                event={event}
                open={commentOpen}
                handleClose={handleCommentClose}
              ></CommentModal>
            </Box>
          )}
          {event.status === "rejected" && (
            <Box sx={{}}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/hod/event/${event._id}`)}
                sx={{ mr: 1, mb: 1 }}
              >
                View Details
              </Button>
              <IconButton onClick={handleOpen}>
                <RemoveRedEyeIcon
                  sx={{
                    color: "rgb(137, 144, 222)",
                  }}
                ></RemoveRedEyeIcon>
              </IconButton>

              <IconButton onClick={handleCommentOpen}>
                <CommentIcon
                  sx={{
                    color: "rgb(182, 182, 187)",
                  }}
                ></CommentIcon>
              </IconButton>

              {activePage == 'proposal' && (
                  <Button
                    variant="contained"
                    sx={{
                      padding: 0,
                      textTransform: "none",
                    }}
                    onClick={handleProposalLetterView}
                  >
                    proposal
                  </Button>
                )}

              <ViewContentModal
                event={event}
                open={open}
                handleOpen={handleOpen}
                handleClose={handleClose}
              ></ViewContentModal>

              <CommentModal
                event={event}
                open={commentOpen}
                handleClose={handleCommentClose}
              ></CommentModal>
            </Box>
          )}

          {event.status === "pending" && (
            <Box>
              <Box sx={{}}>
                <IconButton onClick={handleOpen}>
                  <RemoveRedEyeIcon
                    sx={{
                      color: "rgb(137, 144, 222)",
                    }}
                  ></RemoveRedEyeIcon>
                </IconButton>

                <IconButton onClick={handleCommentOpen}>
                  <CommentIcon
                    sx={{
                      color: "rgb(182, 182, 187)",
                    }}
                  ></CommentIcon>
                </IconButton>
                {activePage == 'proposal' &&(
                  <Button
                    variant="contained"
                    sx={{
                      padding: 0,
                      textTransform: "none",
                    }}
                    onClick={handleProposalLetterView}
                  >
                    proposal
                  </Button>
                )}

                <ViewContentModal
                  event={event}
                  open={open}
                  handleOpen={handleOpen}
                  handleClose={handleClose}
                ></ViewContentModal>

                <CommentModal
                  event={event}
                  open={commentOpen}
                  handleClose={handleCommentClose}
                ></CommentModal>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EventOverviewCard;
