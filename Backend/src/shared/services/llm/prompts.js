export const PROMPTS = {
  brochureDescription: (event) => ({
    system: 'You are an expert academic event copywriter. Write clear, compelling, and professional descriptions for university events, workshops, and training programs.',
    user: `Generate a professional event description for the following event:
Title: ${event.title || event.name}
Department: ${event.department || event.departmentName || 'General'}
Type: ${event.eventType || event.type || 'Workshop'}
Duration: ${event.duration || event.startDate ? `${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''}` : 'TBD'}
Target Audience: ${event.targetAudience || event.eligibility || 'Students and Faculty'}

Provide: 1) A compelling 2-3 sentence overview, 2) Three key learning objectives, 3) Target audience description. Format as JSON: { "overview": "...", "learningObjectives": ["...", "...", "..."], "targetAudience": "..." }`,
  }),

  certificateText: (participant, event) => ({
    system: 'You are an expert at writing personalized academic achievement certificates. Generate warm, professional, and specific recognition text.',
    user: `Generate a personalized achievement certificate text for:
Participant: ${participant.name || 'Student'}
Event: ${event.title || event.name}
Role: ${participant.role || 'participant'}
Department: ${participant.department || 'General'}

Write 2-3 sentences that acknowledge their participation, mention specific skills gained, and offer encouragement. Return as JSON: { "achievementText": "...", "skillsHighlighted": ["...", "..."], "congratulatoryMessage": "..." }`,
  }),

  feedbackSentiment: (feedbackText) => ({
    system: 'You are an expert at analyzing sentiment in educational feedback. Analyze open-ended feedback and extract structured insights.',
    user: `Analyze the sentiment and key themes in this feedback:
"${feedbackText}"

Return as JSON: { "sentiment": "positive|negative|neutral|mixed", "score": 0.0-1.0, "keyPhrases": ["..."], "suggestedImprovements": ["..."] }`,
  }),

  eventRecommendation: (participant, events) => ({
    system: 'You are an AI assistant that recommends academic events to university students and faculty based on their profile and history.',
    user: `Based on this participant profile and available events, recommend the most relevant events:
Name: ${participant.name || 'Student'}
Department: ${participant.department || 'General'}
Interests: ${participant.interests ? participant.interests.join(', ') : 'Not specified'}
Past Events: ${participant.pastEvents ? participant.pastEvents.join(', ') : 'None'}

Available Events:
${events.map((e, i) => `${i + 1}. ${e.title || e.name} (${e.department || 'General'}) - ${e.description ? e.description.substring(0, 100) : 'No description'}`).join('\n')}

Return as JSON: { "recommendations": [{"eventIndex": 0, "reason": "..."}], "summary": "..." }`,
  }),

  budgetSuggestions: (event, claims) => ({
    system: 'You are a university event budget planning assistant. Help optimize budget allocation and detect anomalies.',
    user: `Analyze the budget for this event and provide optimization suggestions:
Event: ${event.title || event.name}
Budget: ${event.budget ? `Rs. ${event.budget}` : 'Not specified'}
Expenses: ${event.expenses ? JSON.stringify(event.expenses) : 'None'}
Previous Claims: ${claims ? JSON.stringify(claims) : 'None'}

Return as JSON: { "suggestions": [{"category": "...", "suggestedAmount": 0, "rationale": "..."}], "anomalies": [{"description": "...", "severity": "low|medium|high"}], "summary": "..." }`,
  }),

  dynamicTone: (event, tone) => ({
    system: 'You are a versatile academic copywriter who can adapt tone for different audiences.',
    user: `Rewrite the following event description in a ${tone} tone:
Title: ${event.title || event.name}
Current Description: ${event.description || 'No description'}

Tones available: "formal" (official university notice), "warm" (welcoming), "enthusiastic" (student-focused), "brief" (concise bulletin), "detailed" (comprehensive brochure)

Return the rewritten description only, no JSON.`,
  }),
};

export default PROMPTS;
