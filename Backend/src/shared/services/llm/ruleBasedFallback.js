import logger from '../../utils/logger.js';

const templates = {
  brochureOverview: (event) => {
    const name = event.title || event.name || 'Event';
    const dept = event.department || event.departmentName || 'University';
    const type = event.eventType || event.type || 'program';
    return `${dept} proudly presents "${name}" — a comprehensive ${type} designed to enhance knowledge and practical skills. This program offers participants a unique opportunity to learn from experienced professionals and gain hands-on experience in a collaborative academic environment.`;
  },

  learningObjectives: (event) => {
    const topics = event.topics || [];
    if (topics.length >= 3) return topics.slice(0, 3);
    return [
      'Understand fundamental concepts and advanced techniques',
      'Develop practical skills through hands-on sessions',
      'Apply learned knowledge to real-world scenarios',
    ];
  },

  certificateAchievement: (participant, event) => {
    const name = participant.name || 'Participant';
    const eventName = event.title || event.name || 'the program';
    return `${name} has successfully completed ${eventName}, demonstrating dedication and active participation throughout the program.`;
  },

  sentimentLabel: (score) => {
    if (score > 0.6) return 'positive';
    if (score > 0.3) return 'neutral';
    return 'negative';
  },

  sentimentScore: () => 0.5 + (Math.random() * 0.4 - 0.2),

  keyPhrases: (text) => {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'them', 'very', 'just', 'also', 'more', 'some', 'than', 'then', 'about', 'could', 'would', 'should', 'well', 'much', 'still', 'such']);
    const freq = {};
    for (const w of words) {
      if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w);
  },

  toneVariants: {
    formal: (text) => text,
    warm: (text) => `We are delighted to invite you to ${text.slice(0, 1).toLowerCase() + text.slice(1)}`,
    enthusiastic: (text) => `🎯 Exciting opportunity! ${text} Don't miss out on this amazing chance to learn and grow!`,
    brief: (text) => text.length > 200 ? text.substring(0, 197) + '...' : text,
    detailed: (text) => text + ' Participants will receive certificates upon successful completion. Limited seats available. Register now to secure your spot!',
  },

  budgetOptimization: (budget) => {
    const total = budget || 100000;
    return {
      suggestions: [
        { category: 'Speaker Honorarium', suggestedAmount: Math.round(total * 0.3), rationale: 'Quality speakers drive event value' },
        { category: 'Logistics & Venue', suggestedAmount: Math.round(total * 0.25), rationale: 'Essential for smooth execution' },
        { category: 'Materials & Kits', suggestedAmount: Math.round(total * 0.2), rationale: 'Hands-on learning requires resources' },
        { category: 'Refreshments', suggestedAmount: Math.round(total * 0.15), rationale: 'Standard hospitality allocation' },
        { category: 'Contingency', suggestedAmount: Math.round(total * 0.1), rationale: 'Buffer for unforeseen expenses' },
      ],
      summary: `Recommended budget allocation of Rs. ${total.toLocaleString()} based on standard university event proportions.`,
    };
  },
};

export function generateFallback(type, params) {
  logger.info(`Using rule-based fallback for: ${type}`);
  const fn = templates[type];
  if (!fn) {
    logger.warn(`No fallback template for: ${type}`);
    return null;
  }
  try {
    return fn(params);
  } catch (err) {
    logger.error(`Fallback generation failed for ${type}: ${err.message}`);
    return null;
  }
}

export default templates;
