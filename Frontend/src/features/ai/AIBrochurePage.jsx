import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Card, CardContent, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Grid,
  Alert, Snackbar, Chip, Divider, Paper, IconButton,
} from "@mui/material";
import { AutoAwesome, Download, Preview, Refresh } from "@mui/icons-material";
import api from "../../utils/api";

const TONES = [
  { value: "standard", label: "Standard" },
  { value: "formal", label: "Formal (Official Notice)" },
  { value: "warm", label: "Warm (Welcoming)" },
  { value: "enthusiastic", label: "Enthusiastic (Student-focused)" },
  { value: "brief", label: "Brief (Concise)" },
  { value: "detailed", label: "Detailed (Comprehensive)" },
];

const AIBrochurePage = () => {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState("");
  const [tone, setTone] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [fetchingEvents, setFetchingEvents] = useState(true);

  useEffect(() => {
    api.get("/coordinator/events")
      .then((res) => setEvents(res.data?.events || res.data || []))
      .catch(() => setEvents([]))
      .finally(() => setFetchingEvents(false));
  }, []);

  const generateContent = async () => {
    if (!eventId) { setError("Please select an event"); return; }
    setLoading(true);
    setError("");
    setContent(null);
    try {
      const res = await api.post("/ai/smart-brochure", { eventId, tone });
      setContent(res.data.content);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate content");
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await api.get(`/ai/smart-brochure/${eventId}/pdf`, {
        params: { tone },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `brochure-${eventId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF");
    }
    setPdfLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AutoAwesome color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>AI Brochure Generator</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Generate professional event brochures with AI-powered content. Choose a tone and customize.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Event</InputLabel>
                <Select
                  value={eventId}
                  label="Select Event"
                  onChange={(e) => setEventId(e.target.value)}
                >
                  {fetchingEvents ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : events.length === 0 ? (
                    <MenuItem disabled>No events found</MenuItem>
                  ) : events.map((ev) => (
                    <MenuItem key={ev._id} value={ev._id}>
                      {ev.title || ev.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tone</InputLabel>
                <Select value={tone} label="Tone" onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={generateContent}
                disabled={loading || !eventId}
                startIcon={loading ? <CircularProgress size={18} /> : <AutoAwesome />}
              >
                {loading ? "Generating..." : "Generate"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {content && (
        <>
          <Box display="flex" gap={1} mb={2}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={downloadPDF}
              disabled={pdfLoading}
            >
              {pdfLoading ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={generateContent}
            >
              Regenerate
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Generated Content</Typography>
              <Chip label={`Tone: ${tone}`} size="small" sx={{ mb: 2 }} />

              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Overview
                </Typography>
                <Typography variant="body1">{content.overview}</Typography>
              </Paper>

              {content.learningObjectives?.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Learning Objectives
                  </Typography>
                  {content.learningObjectives.map((obj, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                      {i + 1}. {obj}
                    </Typography>
                  ))}
                </Paper>
              )}

              {content.targetAudience && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Target Audience
                  </Typography>
                  <Typography variant="body1">{content.targetAudience}</Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AIBrochurePage;
