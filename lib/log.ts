import winston from "winston";

export const logger = winston.createLogger({
  defaultMeta: {
    service: `powerpcu_export_${Deno.env.get("VERSION") || ""}`,
  },
  format: winston.format.printf((info) => {
    return `${new Date().toLocaleString()}|${info.service}|${
      info.level
    }: ${JSON.stringify(info.message)}`;
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
