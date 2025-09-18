const isDev = import.meta.env.DEV;
const debugEnabled = import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev || debugEnabled) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDev || debugEnabled) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev || debugEnabled) {
      console.warn(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (debugEnabled) {
      console.log('🐛', ...args);
    }
  },
};
