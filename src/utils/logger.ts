/* eslint-disable @typescript-eslint/no-explicit-any */

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const CURRENT_LOG_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG;

function log(level: LogLevel, message: string, ...args: any[]) {
  if (level >= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...args);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        break;
    }
  }
}

export const logger = {
  debug: (message: string, ...args: any[]) =>
    log(LogLevel.DEBUG, message, ...args),
  info: (message: string, ...args: any[]) =>
    log(LogLevel.INFO, message, ...args),
  warn: (message: string, ...args: any[]) =>
    log(LogLevel.WARN, message, ...args),
  error: (message: string, ...args: any[]) =>
    log(LogLevel.ERROR, message, ...args),
};

// Example usage:
// logger.info("Email saved successfully.", { emailId: emailDocument.emailId });
// logger.error("Error saving email:", error);
