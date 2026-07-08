import llm from '../../../shared/services/llm/index.js';
import logger from '../../../shared/utils/logger.js';

export async function personalizeCertificateText(participant, event) {
  if (!participant || !event) return null;

  const result = await llm.generateContent('certificateText', { participant, event });

  if (result && result.achievementText) {
    logger.info(`AI certificate text generated for ${participant.name || 'participant'}`);
    return result;
  }

  return {
    achievementText: `${participant.name || 'Participant'} has successfully completed ${event.title || event.name || 'the program'}.`,
    skillsHighlighted: [],
    congratulatoryMessage: 'Congratulations on your achievement!',
  };
}

export async function generateBulkCertificateText(participants, event) {
  const results = [];
  for (const p of participants) {
    const text = await personalizeCertificateText(p, event);
    results.push({ participantId: p._id || p.id, name: p.name, certificateText: text });
  }
  return results;
}

export default { personalizeCertificateText, generateBulkCertificateText };
