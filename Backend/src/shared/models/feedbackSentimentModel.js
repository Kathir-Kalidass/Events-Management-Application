import mongoose from 'mongoose';

const feedbackSentimentSchema = new mongoose.Schema({
  feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral', 'mixed'], required: true },
  score: { type: Number, min: 0, max: 1, required: true },
  keyPhrases: [String],
  suggestedImprovements: [String],
  originalText: String,
  createdAt: { type: Date, default: Date.now },
});

feedbackSentimentSchema.index({ eventId: 1, createdAt: -1 });

export default mongoose.model('FeedbackSentiment', feedbackSentimentSchema);
