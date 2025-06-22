import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";

const MyCertificates = ({ participantId }) => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5050/api/participant/my-certificates/${participantId}`)
      .then(res => res.json())
      .then(data => setCertificates(data));
  }, [participantId]);

  return (
    <div>
      <Typography variant="h5" gutterBottom>My Certificates</Typography>
      <Grid container spacing={2}>
        {certificates.map((cert, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6">{cert.eventId.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(cert.eventId.startDate).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  href={cert.certificateUrl}
                  download
                  variant="contained"
                  color="primary"
                >
                  Download Certificate
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default MyCertificates;
