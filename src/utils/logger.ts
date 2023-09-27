import bunyan from "bunyan";
import { envConfig } from "../config/env";

const streams: any[] = [];
const name = `DUPLO-SERVICE-${envConfig.env || ""}`.toUpperCase();

if (envConfig.env === "production") {
  streams.push({
    stream: process.stdout,
    level: "debug",
  });
} else {
  streams.push({
    stream: process.stdout,
    level: "debug",
  });
}

export const LoggingService = bunyan.createLogger({
  name,
  streams,
  serializers: bunyan.stdSerializers,
});
