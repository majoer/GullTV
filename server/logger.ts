import winston from "winston";

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize({}),
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${`[${level}]`.padEnd(17)}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export const vlcLogger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  defaultMeta: { service: "vlc" },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
