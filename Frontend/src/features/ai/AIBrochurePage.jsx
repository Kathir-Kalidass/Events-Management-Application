import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Card, CardContent, TextField,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Grid,
  Alert, Chip, Divider, Paper, IconButton, Tooltip, Tab, Tabs,
} from "@mui/material";
import {
  AutoAwesome, Download, Refresh, Edit, Visibility, Save,
  Add, Delete, Preview,
} from "@mui/icons-material";
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
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [events, setEvents] = useState([]);
  const [fetchingEvents, setFetchingEvents] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const [editedOverview, setEditedOverview] = useState("");
  const [editedObjectives, setEditedObjectives] = useState([]);
  const [editedAudience, setEditedAudience] = useState("");

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
    setSuccess("");
    try {
      const res = await api.post("/ai/smart-brochure", { eventId, tone });
      const c = res.data.content;
      setContent(c);
      setEditedOverview(c.overview || "");
      setEditedObjectives(c.learningObjectives?.map((o) => (typeof o === "string" ? o : o)) || [""]);
      setEditedAudience(c.targetAudience || "");
      setEditMode(false);
      setTabIndex(0);
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
      setSuccess("PDF downloaded successfully");
    } catch (err) {
      setError("Failed to download PDF");
    }
    setPdfLoading(false);
  };

  const handleObjectiveChange = (index, value) => {
    const updated = [...editedObjectives];
    updated[index] = value;
    setEditedObjectives(updated);
  };

  const addObjective = () => {
    setEditedObjectives([...editedObjectives, ""]);
  };

  const removeObjective = (index) => {
    if (editedObjectives.length <= 1) return;
    setEditedObjectives(editedObjectives.filter((_, i) => i !== index));
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      const payload = {
        eventId,
        tone,
        overview: editedOverview,
        learningObjectives: editedObjectives.filter(Boolean),
        targetAudience: editedAudience,
      };
      await api.post("/ai/smart-brochure", payload);
      setContent({
        overview: editedOverview,
        learningObjectives: editedObjectives.filter(Boolean),
        targetAudience: editedAudience,
        tone,
      });
      setEditMode(false);
      setSuccess("Changes saved");
    } catch (err) {
      setError("Failed to save edits");
    }
    setSaving(false);
  };

  const toggleEdit = () => {
    if (editMode) {
      setEditedOverview(content.overview);
      setEditedObjectives(content.learningObjectives?.map((o) => (typeof o === "string" ? o : o)) || [""]);
      setEditedAudience(content.targetAudience);
    }
    setEditMode(!editMode);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AutoAwesome color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>AI Brochure Generator</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Event</InputLabel>
                <Select
                  value={eventId}
                  label="Select Event"
                  onChange={(e) => { setEventId(e.target.value); setContent(null); }}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tone</InputLabel>
                <Select value={tone} label="Tone" onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                fullWidth
                onClick={generateContent}
                disabled={loading || !eventId}
                startIcon={loading ? <CircularProgress size={18} /> : <AutoAwesome />}
                sx={{ py: 1.5 }}
              >
                {loading ? "Generating..." : "Generate AI Content"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {content && (
        <>
          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={pdfLoading ? <CircularProgress size={18} color="inherit" /> : <Download />}
              onClick={downloadPDF}
              disabled={pdfLoading}
            >
              {pdfLoading ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button
              variant={editMode ? "contained" : "outlined"}
              color={editMode ? "success" : "primary"}
              startIcon={editMode ? <Save /> : <Edit />}
              onClick={editMode ? handleSaveEdits : toggleEdit}
              disabled={saving}
            >
              {saving ? "Saving..." : editMode ? "Save Edits" : "Edit Content"}
            </Button>
            {editMode && (
              <Button variant="text" onClick={toggleEdit} startIcon={<Visibility />}>
                Cancel
              </Button>
            )}
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Generated Content</Typography>
                <Chip label={`Tone: ${tone}`} size="small" />
              </Box>

              <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Learning Objectives" />
                <Tab label="Target Audience" />
              </Tabs>

              {tabIndex === 0 && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Event Overview
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editedOverview}
                      onChange={(e) => setEditedOverview(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1">{content.overview}</Typography>
                  )}
                </Paper>
              )}

              {tabIndex === 1 && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Learning Objectives
                  </Typography>
                  {editMode ? (
                    <Box>
                      {editedObjectives.map((obj, i) => (
                        <Box key={i} display="flex" gap={1} mb={1} alignItems="center">
                          <Typography variant="body2" sx={{ minWidth: 24 }}>{i + 1}.</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={obj}
                            onChange={(e) => handleObjectiveChange(i, e.target.value)}
                          />
                          <IconButton size="small" color="error" onClick={() => removeObjective(i)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      <Button size="small" startIcon={<Add />} onClick={addObjective} sx={{ mt: 1 }}>
                        Add Objective
                      </Button>
                    </Box>
                  ) : (
                    content.learningObjectives?.map((obj, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                        {i + 1}. {obj}
                      </Typography>
                    ))
                  )}
                </Paper>
              )}

              {tabIndex === 2 && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Target Audience
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={editedAudience}
                      onChange={(e) => setEditedAudience(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1">{content.targetAudience}</Typography>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!content && !loading && eventId && (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
          <AutoAwesome sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            Click "Generate AI Content" to create your brochure
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AIBrochurePage;
