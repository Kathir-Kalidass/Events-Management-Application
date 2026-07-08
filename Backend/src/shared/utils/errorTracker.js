import ErrorRecord from '../models/errorRecordModel.js';
import logger from './logger.js';

export const captureError = async (err, req = {}) => {
  try {
    const errorDoc = new ErrorRecord({
      message: err.message || 'Unknown error',
      stack: err.stack,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: err.statusCode || err.status || 500,
      user: req.user?._id?.toString() || req.user?.email || 'unauthenticated',
    });
    await errorDoc.save();
  } catch (saveErr) {
    logger.error('Failed to persist error record:', { error: saveErr.message });
  }
};
