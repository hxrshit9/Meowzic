import { MeowzicClient } from './client/MeowzicClient.js';
import { Logger } from './utils/logger.js';

Logger.info('Initializing Meowzic audio engine...', 'Main');

const client = new MeowzicClient();

client.start().catch((err) => {
  Logger.error('Fatal crash during bot startup', err, 'Main');
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  Logger.warn('Received SIGINT. Gracefully destroying players and shutting down...', 'Main');
  client.kazagumo.players.forEach((p) => p.destroy());
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.warn('Received SIGTERM. Gracefully destroying players and shutting down...', 'Main');
  client.kazagumo.players.forEach((p) => p.destroy());
  client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('Unhandled Promise Rejection', reason, 'Main');
});

process.on('uncaughtException', (err) => {
  Logger.error('Uncaught Exception', err, 'Main');
});
