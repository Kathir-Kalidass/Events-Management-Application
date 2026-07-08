import llm from '../../../shared/services/llm/index.js';
import FeedbackSentiment from '../../../shared/models/feedbackSentimentModel.js';
import logger from '../../../shared/utils/logger.js';

export async function analyzeSingleFeedback(feedbackText, feedbackId, eventId) {
  const result = await llm.generateContent('feedbackSentiment', { feedbackText });

  const record = {
    feedbackId,
    eventId,
    sentiment: result?.sentiment || 'neutral',
    score: result?.score ?? 0.5,
    keyPhrases: result?.keyPhrases || [],
    suggestedImprovements: result?.suggestedImprovements || [],
    originalText: feedbackText,
  };

  try {
    await FeedbackSentiment.create(record);
    logger.info(`Sentiment stored for feedback ${feedbackId}: ${record.sentiment}`);
  } catch (err) {
    logger.error(`Failed to store sentiment: ${err.message}`);
  }

  return record;
}

export async function analyzeBulkFeedback(feedbackList) {
  const results = [];
  for (const fb of feedbackList) {
    const record = await analyzeSingleFeedback(fb.text, fb._id || fb.id, fb.eventId);
    results.push(record);
  }
  return results;
}

export async function getEventSentimentTrends(eventId) {
  const records = await FeedbackSentiment.find({ eventId }).sort({ createdAt: -1 }).lean();

  const summary = { positive: 0, negative: 0, neutral: 0, mixed: 0, total: records.length };
  for (const r of records) {
    if (summary[r.sentiment] !== undefined) summary[r.sentiment]++;
  }

  const avgScore = records.length
    ? records.reduce((sum, r) => sum + r.score, 0) / records.length
    : 0;

  const topPhrases = {};
  for (const r of records) {
    for (const p of (r.keyPhrases || [])) {
      topPhrases[p] = (topPhrases[p] || 0) + 1;
    }
  }

  return {
    eventId,
    summary,
    averageScore: Math.round(avgScore * 100) / 100,
    topPhrases: Object.entries(topPhrases)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count })),
    totalAnalyzed: records.length,
  };
}

export default { analyzeSingleFeedback, analyzeBulkFeedback, getEventSentimentTrends };
