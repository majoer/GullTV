import winston from "winston";

const format = winston.format.combine(
  winston.format.colorize({}),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${`[${level}]`.padEnd(17)}: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: "debug",
  format,
  transports: [new winston.transports.Console()],
});

export const vlcLogger = winston.createLogger({
  level: "error",
  format,
  transports: [new winston.transports.Console()],
});
