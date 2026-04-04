type LogContext = Record<string, unknown>;

const PREFIX = '[Zentry]';

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return error;
}

function withContext(context?: LogContext) {
  return context ? [context] : [];
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (!__DEV__) {
      return;
    }

    console.debug(PREFIX, message, ...withContext(context));
  },

  info(message: string, context?: LogContext) {
    if (!__DEV__) {
      return;
    }

    console.info(PREFIX, message, ...withContext(context));
  },

  warn(message: string, error?: unknown, context?: LogContext) {
    console.warn(PREFIX, message, normalizeError(error), ...withContext(context));
  },

  error(message: string, error?: unknown, context?: LogContext) {
    console.error(PREFIX, message, normalizeError(error), ...withContext(context));
  },
};
