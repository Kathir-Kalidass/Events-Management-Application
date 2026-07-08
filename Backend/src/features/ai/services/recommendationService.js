import llm from '../../../shared/services/llm/index.js';
import Event from '../../../shared/models/eventModel.js';
import logger from '../../../shared/utils/logger.js';

export async function getRecommendationsForParticipant(participant) {
  const allEvents = await Event.find({ isActive: true })
    .sort({ startDate: -1 })
    .limit(20)
    .lean();

  if (!allEvents.length) return { recommendations: [], summary: 'No events available.' };

  const result = await llm.generateContent('eventRecommendation', {
    participant: {
      name: participant.name || 'Participant',
      department: participant.department || 'General',
      interests: participant.interests || [],
      pastEvents: participant.pastEvents || [],
    },
    events: allEvents,
  });

  if (result?.recommendations?.length) {
    return {
      recommendations: result.recommendations.map((r) => ({
        event: allEvents[r.eventIndex] || null,
        reason: r.reason,
      })).filter((r) => r.event),
      summary: result.summary || '',
    };
  }

  return {
    recommendations: allEvents.slice(0, 3).map((e) => ({
      event: e,
      reason: `Based on your interest in ${participant.department || 'general'} domain.`,
    })),
    summary: 'Recommended events based on your profile.',
  };
}

export async function getRecommendationsForDepartment(department, limit = 5) {
  const events = await Event.find({
    $or: [
      { department },
      { departmentName: department },
      { targetAudience: { $regex: department, $options: 'i' } },
    ],
    isActive: true,
  })
    .sort({ startDate: -1 })
    .limit(limit)
    .lean();

  return events;
}

export default { getRecommendationsForParticipant, getRecommendationsForDepartment };
