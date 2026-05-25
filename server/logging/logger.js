const pino = require('pino')

const fileTransport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: `${__dirname}/logs/app.log` }
    }
  ]
  
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  fileTransport
);

module.exports = logger;