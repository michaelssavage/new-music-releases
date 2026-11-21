import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

// An AxiosError serialises its request config, which includes the Authorization header and client secret.
export function toLoggable(data: unknown): unknown {
  if (!axios.isAxiosError(data)) return data;

  return {
    name: data.name,
    message: data.message,
    status: data.response?.status,
    method: data.config?.method,
    url: data.config?.url,
    response: data.response?.data,
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  private createLogMessage(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): LogMessage {
    return {
      timestamp: format(new Date(), "dd-MM-yyyy HH:mm:ss", { locale: es }),
      level,
      message,
      data,
    };
  }

  private formatMessage({
    timestamp,
    level,
    message,
    data,
  }: LogMessage): string {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${
      data ? `\n${JSON.stringify(data, null, 2)}` : ""
    }`;
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    if (!this.isDevelopment && level === "debug") return;

    const logMessage = this.createLogMessage(level, message, toLoggable(data));

    const formattedMessage = this.formatMessage(logMessage);

    switch (level) {
      case "debug":
        console.log(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, data?: unknown) {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data);
  }
}

export const logger = new Logger();
