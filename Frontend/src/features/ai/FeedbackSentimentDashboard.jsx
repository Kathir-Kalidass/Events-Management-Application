import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, Card, CardContent, Grid, Chip,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
  Paper, Divider,
} from "@mui/material";
import {
  SentimentSatisfied, SentimentDissatisfied, SentimentNeutral,
  AutoGraph, TrendingUp, TrendingDown,
} from "@mui/icons-material";
import api from "../../utils/api";

const SentimentIcon = ({ sentiment, size = 40 }) => {
  const icons = {
    positive: <SentimentSatisfied sx={{ fontSize: size, color: "success.main" }} />,
    negative: <SentimentDissatisfied sx={{ fontSize: size, color: "error.main" }} />,
    neutral: <SentimentNeutral sx={{ fontSize: size, color: "warning.main" }} />,
    mixed: <SentimentNeutral sx={{ fontSize: size, color: "info.main" }} />,
  };
  return icons[sentiment] || icons.neutral;
};

const FeedbackSentimentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/coordinator/events")
      .then((res) => setEvents(res.data?.events || res.data || []))
      .catch(() => {})
      .finally(() => setEventLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    setError("");
    api.get(`/ai/feedback/trends/${selectedEventId}`)
      .then((res) => setTrends(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load trends");
        setTrends(null);
      })
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AutoGraph color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>Feedback Sentiment Dashboard</Typography>
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 3, maxWidth: 400 }}>
        <InputLabel>Select Event</InputLabel>
        <Select
          value={selectedEventId}
          label="Select Event"
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          {eventLoading ? (
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}

      {trends && !loading && (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <SentimentIcon sentiment="positive" />
                  <Typography variant="h4" color="success.main">
                    {trends.summary?.positive || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Positive</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <SentimentIcon sentiment="negative" />
                  <Typography variant="h4" color="error.main">
                    {trends.summary?.negative || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Negative</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <SentimentIcon sentiment="neutral" />
                  <Typography variant="h4" color="warning.main">
                    {trends.summary?.neutral || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Neutral</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <TrendingUp color={trends.averageScore > 0.5 ? "success" : "error"} sx={{ fontSize: 40 }} />
                  <Typography variant="h4">
                    {(trends.averageScore * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Score</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Key Phrases</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {trends.topPhrases?.map((p, i) => (
                  <Chip
                    key={i}
                    label={`${p.phrase} (${p.count})`}
                    size="small"
                    color={p.count > 2 ? "primary" : "default"}
                  />
                ))}
                {(!trends.topPhrases || trends.topPhrases.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No phrases extracted yet. Submit feedback first.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !trends && selectedEventId && (
        <Alert severity="info">No sentiment data available for this event yet.</Alert>
      )}
    </Container>
  );
};

export default FeedbackSentimentDashboard;
