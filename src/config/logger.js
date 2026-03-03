 const { createLogger, format, transports } = require('winston');

// Configure logger
const logger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/api.log' }), // Log to a file
  ],
});

const cronLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/cron.log' }), // Log to a file
  ],
});

const projectIvrsLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/projectIvrs.log' }), // Log to a file
  ],
});

const projectFacebookLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/projectFacebook.log' }), // Log to a file
  ],
});

const projectIVRVoiceLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/projectIvrVoice.log' }), // Log to a file
  ],
});

const anarockSPlusProjectLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/anarockProjectSPlus.log' }), // Log to a file
  ],
});

const instituteFacebookLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/instituteFacebook.log' }), // Log to a file
  ],
});

const instituteRoundRobinLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `${timestamp} [${level.toUpperCase()}] : ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/instituteRoundRobinLogger.log' }), // Log to a file
  ],
});

const sourceKeyRemoveLogger = createLogger({
  level: 'info', // Set the minimum logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}] : ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`
    )
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'src/logs/sourceKeyRemove.log' }), // Log to a file
  ],
});

// module.exports = logger;
module.exports = {
  logger,
  cronLogger,
  projectIvrsLogger,
  projectFacebookLogger,
  projectIVRVoiceLogger,
  anarockSPlusProjectLogger,
  instituteFacebookLogger,
  instituteRoundRobinLogger,
  sourceKeyRemoveLogger
}
