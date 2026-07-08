import llm from '../../../shared/services/llm/index.js';
import logger from '../../../shared/utils/logger.js';

const DEFAULT_OPTIMIZATION = {
  suggestions: [
    { category: 'Speaker Honorarium', suggestedAmount: 0, rationale: 'Allocate based on speaker profile and session count' },
    { category: 'Logistics & Venue', suggestedAmount: 0, rationale: 'Cover venue, equipment, and setup costs' },
    { category: 'Materials & Kits', suggestedAmount: 0, rationale: 'Printed materials, stationery, and participant kits' },
    { category: 'Refreshments', suggestedAmount: 0, rationale: 'Tea, coffee, and lunch for participants' },
    { category: 'Contingency', suggestedAmount: 0, rationale: '10% buffer for unforeseen expenses' },
  ],
  anomalies: [],
  summary: 'Budget optimization suggestions based on standard university event guidelines.',
};

export async function optimizeBudget(eventData, claimsData = []) {
  if (!eventData) return DEFAULT_OPTIMIZATION;

  const result = await llm.generateContent('budgetSuggestions', {
    event: eventData,
    claims: claimsData,
  });

  if (result?.suggestions?.length) {
    const totalBudget = eventData.budget || 0;
    const allSuggestionAmounts = result.suggestions.reduce((sum, s) => sum + (s.suggestedAmount || 0), 0);

    if (totalBudget > 0 && allSuggestionAmounts > 0 && Math.abs(allSuggestionAmounts - totalBudget) > 1) {
      const ratio = totalBudget / allSuggestionAmounts;
      result.suggestions = result.suggestions.map((s) => ({
        ...s,
        suggestedAmount: Math.round((s.suggestedAmount || 0) * ratio),
      }));
    }

    return result;
  }

  if (eventData.budget) {
    const total = eventData.budget;
    DEFAULT_OPTIMIZATION.suggestions = DEFAULT_OPTIMIZATION.suggestions.map((s) => ({
      ...s,
      suggestedAmount: {
        'Speaker Honorarium': Math.round(total * 0.3),
        'Logistics & Venue': Math.round(total * 0.25),
        'Materials & Kits': Math.round(total * 0.2),
        'Refreshments': Math.round(total * 0.15),
        'Contingency': Math.round(total * 0.1),
      }[s.category] || 0,
    }));
  }

  return DEFAULT_OPTIMIZATION;
}

export async function detectAnomalies(claims) {
  if (!claims?.length) return [];

  const result = await llm.generateContent('budgetSuggestions', {
    event: { title: 'Claims Analysis' },
    claims,
  });

  return result?.anomalies || [];
}

export default { optimizeBudget, detectAnomalies };
