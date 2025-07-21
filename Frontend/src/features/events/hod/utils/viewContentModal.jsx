import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { getDate } from "./getDate";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: 400,
    sm: 600,
    md: 800,
    lg: 900,
  },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const fieldStyle = {
  fontFamily: "sans-serif",
  fontWeight: "bold",
  fontSize: "14px",
  mb: 1.5,
};

const spanStyle = {
  fontFamily: "sans-serif",
  fontSize: "14px",
  fontWeight: "500",
};

function ViewContentModal({ event, open, handleClose }) {

  function getTargetAudience(){
    const audience = event.targetAudience;

    if(!audience || audience.length === 0){
      return "Not mentioned"
    }

    return audience.join(", ");
  }

  function getResourcePersons(){
    const persons = event.resourcePersons;

    if (!persons || persons.length === 0) {
      return "Not mentioned";
    }

    return persons.join(", ");
  }

  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            marginBottom="4px"
            borderBottom="1px solid grey"
            padding="20px"
            fontSize="24px"
            fontWeight="600"
          >
            {event.title}
          </Typography>
          <Box
            id="modal-modal-description"
            sx={{
              p: 3,
              mb: 0,
            }}
          >
            <Typography sx={fieldStyle}>Event Informatin</Typography>

            <Typography sx={fieldStyle}>
              start :{" "}
              <Box component="span" sx={spanStyle}>
                {getDate(event.startDate)}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              End :{" "}
              <Box component="span" sx={spanStyle}>
                {getDate(event.endDate)}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Venue :{" "}
              <Box component="span" sx={spanStyle}>
                {event.venue}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Mode :{" "}
              <Box component="span" sx={spanStyle}>
                {event.mode}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Duration :{" "}
              <Box component="span" sx={spanStyle}>
                {`${event.duration} working days`}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Type :{" "}
              <Box component="span" sx={spanStyle}>
                {event.type}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Budget :{" "}
              <Box component="span" sx={spanStyle}>
                {event.budget}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Status :{" "}
              <Box component="span" sx={spanStyle}>
                {event.status}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Coordinator :{" "}
              <Box component="span" sx={spanStyle}>
                {event.createdBy.name}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Status :{" "}
              <Box component="span" sx={spanStyle}>
                {event.status}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Target Audience :{" "}
              <Box component="span" sx={spanStyle}>
                {getTargetAudience()}
              </Box>
            </Typography>

            <Typography sx={fieldStyle}>
              Resource Persons :{" "}
              <Box component="span" sx={spanStyle}>
                {getResourcePersons()}
              </Box>
            </Typography>

            <Box
              sx={{
                display: "flex",
              }}
            >
              <Typography sx={fieldStyle}>Objectives:</Typography>
              <Box
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  bgcolor: "rgb(240, 241, 244)",
                  width: "450px",
                  ml: 2,
                  borderRadius: "6px",
                  textAlign: "left",
                  textOverflow: "true",
                  wordBreak: "break-word",
                  padding: "7px",
                  mb: 1,
                }}
              >
                This event is to bring awarness to the students about the cse
                cultural events.
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
              }}
            >
              <Typography sx={fieldStyle}>Outcomes:</Typography>
              <Box
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  bgcolor: "rgb(240, 241, 244)",
                  width: "450px",
                  ml: 2,
                  borderRadius: "6px",
                  textAlign: "left",
                  textOverflow: "true",
                  wordBreak: "break-word",
                  padding: "7px",
                }}
              >
                This event is to bring awarness to the students about the cse
                cultural events.
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default ViewContentModal;
