import winston from "winston";

export const logger = winston.createLogger({
  format: winston.format.prettyPrint(),
  defaultMeta: {
    service: `powerpcu_export ${Deno.env.get("VERSION") || ""}`,
    time: new Date().toLocaleString(),
  },
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
