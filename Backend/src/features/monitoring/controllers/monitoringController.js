import os from 'os';
import mongoose from 'mongoose';
import ErrorRecord from '../../../shared/models/errorRecordModel.js';
import logger from '../../../shared/utils/logger.js';

export const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    node: process.version,
    platform: os.platform(),
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    },
    database: dbStatus[dbState] || 'unknown',
    cpu: os.cpus().length + ' cores',
  });
};

export const getStats = async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  const [totalErrors, unresolvedErrors, recentErrors, errorsToday] = await Promise.all([
    ErrorRecord.countDocuments(),
    ErrorRecord.countDocuments({ resolved: false }),
    ErrorRecord.countDocuments({ createdAt: { $gte: lastHour } }),
    ErrorRecord.countDocuments({ createdAt: { $gte: today } }),
  ]);

  res.json({
    errors: {
      total: totalErrors,
      unresolved: unresolvedErrors,
      lastHour: recentErrors,
      today: errorsToday,
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
    },
    timestamp: new Date().toISOString(),
  });
};

export const getRecentErrors = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const resolved = req.query.resolved;
  const filter = {};
  if (resolved === 'true') filter.resolved = true;
  if (resolved === 'false') filter.resolved = false;

  const errors = await ErrorRecord.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(errors);
};

export const resolveError = async (req, res) => {
  const error = await ErrorRecord.findByIdAndUpdate(
    req.params.id,
    { resolved: true },
    { new: true }
  );
  if (!error) return res.status(404).json({ message: 'Error not found' });
  logger.info(`Error ${req.params.id} marked as resolved`);
  res.json(error);
};
