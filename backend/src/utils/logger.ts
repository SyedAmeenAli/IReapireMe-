export const logger = {
  info(message: string, context: Record<string, any> = {}) {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
  warn(message: string, context: Record<string, any> = {}) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
  error(message: string, context: Record<string, any> = {}) {
    console.error(
      JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  },
};

export default logger;
