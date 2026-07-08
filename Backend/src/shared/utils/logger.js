import winston from 'winston';

const LOG_LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const logger = winston.createLogger({
  levels: LOG_LEVELS,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      if (stack) return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}${metaStr}`;
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          if (stack) return `${level} [${timestamp}]: ${message}\n${stack}${metaStr}`;
          return `${level} [${timestamp}]: ${message}${metaStr}`;
        })
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10,
    }),
  ],
});

export default logger;
