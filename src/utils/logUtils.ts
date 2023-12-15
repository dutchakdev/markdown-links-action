export enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}

export enum Verbosity {
    SILENT = 0,
    ERROR_ONLY = 1,
    WARN_AND_ERROR = 2,
    INFO_WARN_ERROR = 3,
    DEBUG_INFO_WARN_ERROR = 4
}

export const currentVerbosity: Verbosity = Verbosity.DEBUG_INFO_WARN_ERROR;

export function parseVerbosityInput(inputValue: string): Verbosity {
    switch (inputValue.toUpperCase()) {
      case 'SILENT':
        return Verbosity.SILENT;
      case 'ERROR_ONLY':
        return Verbosity.ERROR_ONLY;
      case 'WARN_AND_ERROR':
        return Verbosity.WARN_AND_ERROR;
      case 'INFO_WARN_ERROR':
        return Verbosity.INFO_WARN_ERROR;
      case 'DEBUG_INFO_WARN_ERROR':
        return Verbosity.DEBUG_INFO_WARN_ERROR;
      default:
        return Verbosity.DEBUG_INFO_WARN_ERROR;
    }
  }

function log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}]: ${message}`);
}

export function info(message: string): void {
    if (currentVerbosity >= Verbosity.INFO_WARN_ERROR) {
        log(LogLevel.INFO, message);
    }
}

export function warn(message: string): void {
    if (currentVerbosity >= Verbosity.WARN_AND_ERROR) {
        log(LogLevel.WARN, message);
    }
}

export function error(message: string): void {
    if (currentVerbosity >= Verbosity.ERROR_ONLY) {
        log(LogLevel.ERROR, message);
    }
}

export function debug(message: string): void {
    if (currentVerbosity >= Verbosity.DEBUG_INFO_WARN_ERROR && process.env.DEBUG) {
        log(LogLevel.DEBUG, message);
    }
}