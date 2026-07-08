import llm from '../../../shared/services/llm/index.js';
import { generateSmartContent, generateSmartBrochurePDF, listTones } from '../services/smartBrochureService.js';
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

    const result = await llm.generateContent('certificateText', { participant, event });
    res.json(result || { achievementText: '', skillsHighlighted: [], congratulatoryMessage: '' });
  } catch (err) {
    logger.error('AI certificate generation failed:', err);
    res.status(500).json({ message: 'Failed to generate certificate text', error: err.message });
  }
};

export const analyzeFeedback = async (req, res) => {
  try {
    const { feedbackText } = req.body;
    if (!feedbackText) return res.status(400).json({ message: 'Feedback text required' });

    const result = await llm.generateContent('feedbackSentiment', { feedbackText });
    res.json(result || { sentiment: 'neutral', score: 0.5, keyPhrases: [], suggestedImprovements: [] });
  } catch (err) {
    logger.error('AI feedback analysis failed:', err);
    res.status(500).json({ message: 'Failed to analyze feedback', error: err.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { participant, events } = req.body;
    if (!participant || !events) return res.status(400).json({ message: 'Participant and events data required' });

    const result = await llm.generateContent('eventRecommendation', { participant, events });
    res.json(result || { recommendations: [], summary: '' });
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

    const result = await llm.generateContent('budgetSuggestions', { event, claims: claims || [] });
    res.json(result || { suggestions: [], anomalies: [], summary: '' });
  } catch (err) {
    logger.error('AI budget suggestions failed:', err);
    res.status(500).json({ message: 'Failed to generate budget suggestions', error: err.message });
  }
};
