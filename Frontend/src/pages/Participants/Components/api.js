// api.js - Handles API requests for feedback and other participant actions
import { apiPost, apiGet, apiDownload } from '../../../utils/apiUtils.js';

const API_BASE = "/participant";

export async function submitFeedback(feedback) {
  return await apiPost(`${API_BASE}/feedback`, feedback);
}

export async function getFeedbacks() {
  return await apiGet(`${API_BASE}/feedback`);
}

export async function getAllEvents() {
  return await apiGet(`${API_BASE}/events`);
}

export async function registerEvent(registrationData) {
  return await apiPost(`${API_BASE}/register`, registrationData);
}

export async function getMyEvents(participantId) {
  const data = await apiGet(`${API_BASE}/my-events/${participantId}`);
  if (!data) return [];
  
  // Extract the event data from each ParticipantEvent
  return data.map(item => ({
    _id: item.eventId?._id,
    name: item.eventId?.name || item.eventId?.title,
    startDate: item.eventId?.startDate,
    endDate: item.eventId?.endDate,
    venue: item.eventId?.venue,
    mode: item.eventId?.mode,
  }));
}

export async function getCertificates(participantId) {
  return await apiGet(`${API_BASE}/my-certificates/${participantId}`);
}

export async function downloadCertificate(certId) {
  return await apiDownload(`${API_BASE}/certificate/${certId}/download`);
}

// Add more functions (PUT, DELETE) as needed