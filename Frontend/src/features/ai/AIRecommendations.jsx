import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, Card, CardContent, CardActions,
  Button, CircularProgress, Alert, Chip, Grid, Divider,
} from "@mui/material";
import { AutoAwesome, EmojiEvents, School, Event } from "@mui/icons-material";
import api from "../../utils/api";

const AIRecommendations = ({ participant }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/ai/recommendations", { participant });
      setRecommendations(res.data.recommendations || []);
      setSummary(res.data.summary || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get recommendations");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (participant) fetchRecommendations();
  }, [participant]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AutoAwesome color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>AI Recommendations</Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" mb={2}>
        Personalized event recommendations based on your profile, department, and past participation.
      </Typography>

      {summary && (
        <Alert icon={<EmojiEvents />} severity="info" sx={{ mb: 2 }}>
          {summary}
        </Alert>
      )}

      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {recommendations.map((rec, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Event color="primary" />
                  <Typography variant="h6">
                    {rec.event?.title || rec.event?.name || "Event"}
                  </Typography>
                </Box>
                <Chip
                  label={rec.event?.department || rec.event?.departmentName || "General"}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {rec.reason}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!loading && recommendations.length === 0 && !error && (
        <Alert severity="info">
          No recommendations available yet. Complete your profile and participate in events to get personalized suggestions.
        </Alert>
      )}
    </Container>
  );
};

export default AIRecommendations;
