const log = (
  method: 'log' | 'warn' | 'error',
  message?: unknown,
  metadata?: unknown
) => {
  const timestamp = new Date()
    .toISOString()
    .replace('T', '|')
    .replace(/\..*$/, '');
  const args: unknown[] = [timestamp];
  if (message) args.push(message);
  if (metadata) args.push('\n', metadata);
  console[method](...args);
};

const logger = {
  info(message?: unknown, meta?: unknown) {
    log('log', message, meta);
  },

  warn(message?: unknown, meta?: unknown) {
    log('warn', message, meta);
  },

  error(message?: unknown, meta?: unknown) {
    log('error', message, meta);
  },
};

export default logger;
