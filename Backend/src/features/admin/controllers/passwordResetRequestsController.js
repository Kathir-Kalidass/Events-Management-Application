// Simple in-memory password reset requests store (non-persistent)
// Shape: { id, userId, email, role, userName, status, requestedAt, processedAt, reason }

let requests = [];

export const getPasswordResetRequests = async (req, res) => {
  try {
    // Return pending first, then processed
    const pending = requests.filter(r => r.status === 'pending');
    const processed = requests.filter(r => r.status !== 'pending');
    res.json({ requests: [...pending, ...processed] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests', error: err.message });
  }
};

export const approvePasswordReset = async (req, res) => {
  try {
    const { requestId } = req.params;
    const idx = requests.findIndex(r => String(r.id) === String(requestId));
    if (idx === -1) return res.status(404).json({ message: 'Request not found' });
    requests[idx] = {
      ...requests[idx],
      status: 'approved',
      processedAt: new Date().toISOString(),
      reason: undefined,
    };
    return res.json({ message: 'Password reset approved', request: requests[idx] });
  } catch (err) {
    res.status(500).json({ message: 'Error approving request', error: err.message });
  }
};

export const rejectPasswordReset = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body || {};
    const idx = requests.findIndex(r => String(r.id) === String(requestId));
    if (idx === -1) return res.status(404).json({ message: 'Request not found' });
    requests[idx] = {
      ...requests[idx],
      status: 'rejected',
      processedAt: new Date().toISOString(),
      reason: reason || 'Rejected',
    };
    return res.json({ message: 'Password reset rejected', request: requests[idx] });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting request', error: err.message });
  }
};

// Optional helper to seed a request for testing
export function __seedPasswordResetRequest(sample) {
  const id = sample?.id || Math.random().toString(36).slice(2);
  const now = new Date().toISOString();
  const reqObj = {
    id,
    userId: sample?.userId || id,
    email: sample?.email || 'user@example.com',
    role: sample?.role || 'participant',
    userName: sample?.userName || 'Sample User',
    status: 'pending',
    requestedAt: now,
    processedAt: null,
    reason: undefined,
  };
  requests.push(reqObj);
  return reqObj;
}
