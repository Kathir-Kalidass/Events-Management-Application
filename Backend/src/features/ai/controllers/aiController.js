import llm from '../../../shared/services/llm/index.js';
import { generateSmartContent, generateSmartBrochurePDF, listTones } from '../services/smartBrochureService.js';
import { personalizeCertificateText } from '../services/aiCertificateService.js';
import { analyzeSingleFeedback, getEventSentimentTrends } from '../services/feedbackSentimentService.js';
import { getRecommendationsForParticipant } from '../services/recommendationService.js';
import { optimizeBudget, detectAnomalies } from '../services/budgetAssistantService.js';
import logger from '../../../shared/utils/logger.js';

export const getStatus = async (req, res) => {
  const status = await llm.checkHealth();
  res.json(status);
};

export const generateBrochureContent = async (req, res) => {
  try {
    const { event, tone } = req.body;
    if (!event) return res.status(400).json({ message: 'Event data required' });

    const [overview, objectives] = await Promise.all([
      llm.generateContent('brochureOverview', event),
      tone ? llm.generateText('dynamicTone', { ...event, tone }) : null,
    ]);

    res.json({
      overview,
      learningObjectives: objectives || overview?.learningObjectives || [],
      generatedAt: new Date().toISOString(),
      tone: tone || 'standard',
    });
  } catch (err) {
    logger.error('AI brochure generation failed:', err);
    res.status(500).json({ message: 'Failed to generate brochure content', error: err.message });
  }
};

export const generateCertificateText = async (req, res) => {
  try {
    const { participant, event } = req.body;
    if (!participant || !event) return res.status(400).json({ message: 'Participant and event data required' });

    const result = await personalizeCertificateText(participant, event);
    res.json(result || { achievementText: '', skillsHighlighted: [], congratulatoryMessage: '' });
  } catch (err) {
    logger.error('AI certificate generation failed:', err);
    res.status(500).json({ message: 'Failed to generate certificate text', error: err.message });
  }
};

export const analyzeFeedback = async (req, res) => {
  try {
    const { feedbackText, feedbackId, eventId } = req.body;
    if (!feedbackText) return res.status(400).json({ message: 'Feedback text required' });

    const result = await analyzeSingleFeedback(feedbackText, feedbackId, eventId);
    res.json(result);
  } catch (err) {
    logger.error('AI feedback analysis failed:', err);
    res.status(500).json({ message: 'Failed to analyze feedback', error: err.message });
  }
};

export const getFeedbackTrends = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'Event ID required' });

    const trends = await getEventSentimentTrends(eventId);
    res.json(trends);
  } catch (err) {
    logger.error('Failed to get feedback trends:', err);
    res.status(500).json({ message: 'Failed to get feedback trends', error: err.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { participant } = req.body;
    if (!participant) return res.status(400).json({ message: 'Participant data required' });

    const result = await getRecommendationsForParticipant(participant);
    res.json(result);
  } catch (err) {
    logger.error('AI recommendations failed:', err);
    res.status(500).json({ message: 'Failed to generate recommendations', error: err.message });
  }
};

export const smartBrochure = async (req, res) => {
  try {
    const { eventId, tone } = req.body;
    if (!eventId) return res.status(400).json({ message: 'Event ID required' });

    const content = await generateSmartContent(eventId, tone || 'standard');
    res.json({ success: true, content });
  } catch (err) {
    logger.error('Smart brochure generation failed:', err);
    res.status(500).json({ message: 'Failed to generate smart brochure', error: err.message });
  }
};

export const smartBrochurePDF = async (req, res) => {
  try {
    const { tone } = req.query;
    const result = await generateSmartBrochurePDF(req.params.eventId, tone || 'standard');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="brochure-${req.params.eventId}.pdf"`);
    res.send(result.buffer);
  } catch (err) {
    logger.error('Smart brochure PDF generation failed:', err);
    res.status(500).json({ message: 'Failed to generate brochure PDF', error: err.message });
  }
};

export const getTones = async (req, res) => {
  const tones = await listTones();
  res.json({ tones });
};

export const getBudgetSuggestions = async (req, res) => {
  try {
    const { event, claims } = req.body;
    if (!event) return res.status(400).json({ message: 'Event data required' });

    const result = await optimizeBudget(event, claims || []);
    res.json(result);
  } catch (err) {
    logger.error('AI budget suggestions failed:', err);
    res.status(500).json({ message: 'Failed to generate budget suggestions', error: err.message });
  }
};

export const getAnomalies = async (req, res) => {
  try {
    const { claims } = req.body;
    if (!claims?.length) return res.status(400).json({ message: 'Claims data required' });

    const anomalies = await detectAnomalies(claims);
    res.json({ anomalies });
  } catch (err) {
    logger.error('AI anomaly detection failed:', err);
    res.status(500).json({ message: 'Failed to detect anomalies', error: err.message });
  }
};
