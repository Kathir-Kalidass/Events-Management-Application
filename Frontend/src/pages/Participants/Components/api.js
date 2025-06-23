// api.js - Handles API requests for feedback and other participant actions

const API_BASE = "http://localhost:5050/api/participant";

export async function submitFeedback(feedback) {
  const response = await fetch(`${API_BASE}/participant/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = { message: 'No JSON response from server' };
  }
  if (!response.ok) {
    // Attach backend error message if available
    throw new Error(data.message || 'Failed to submit feedback');
  }
  return data;
}

// Example for GET feedback (if needed)
export async function getFeedbacks() {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch feedbacks");
  return res.json();
}

export async function getAllEvents() {
  const res = await fetch(`${API_BASE}/events`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function registerEvent(registrationData) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationData),
  });
  if (!res.ok) throw new Error("Failed to register for event");
  return res.json();
}

export async function getMyEvents(participantId) {
  const res = await fetch(`${API_BASE}/my-events/${participantId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch your events");
  // The backend returns an array of ParticipantEvent objects with eventId populated
  const data = await res.json();
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
  const res = await fetch(`${API_BASE}/certificates/${participantId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch certificates");
  return res.json();
}

export async function downloadCertificate(certId) {
  const res = await fetch(`${API_BASE}/certificate/${certId}/download`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to download certificate");
  // For PDF, you may want to return a Blob:
  return await res.blob();
}

// Add more functions (PUT, DELETE) as needed
