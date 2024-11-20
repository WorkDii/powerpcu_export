import winston from "winston";

export const logger = winston.createLogger({
  defaultMeta: {
    service: `powerpcu_export ${Deno.env.get("VERSION") || ""}`,
    time: new Date().toLocaleString(),
  },
  format: winston.format.printf((info) => {
    return `${info.time} ${info.level}: ${JSON.stringify(info.message)}`;
  }),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
      maxsize: 10000000,
      maxFiles: 10,
    }),

    new winston.transports.File({
      filename: "./logs/combined.log",
      maxFiles: 10,
      maxsize: 10000000,
      level: "info",
    }),
  ],
});
