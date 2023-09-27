import "reflect-metadata";
import dotenv from "dotenv";
import { expand } from "dotenv-expand";
const myEnv = dotenv.config();
expand(myEnv);

/**
 * cache ENV value, its faster!
 *
 */
const envGlobCache: { [x: string]: string } = {};

function getEnv(envKey: string) {
  if (envGlobCache[envKey] !== undefined) {
    return envGlobCache[envKey];
  }
  const newEnv = process.env[envKey];
  if (newEnv !== undefined) {
    envGlobCache[envKey] = newEnv;
    return newEnv;
  }
  return undefined;
}

function getEnvString(envKey: string) {
  const val = getEnv(envKey);
  if (val) {
    return val;
  }
  return "";
}

//@ts-ignore
function getEnvBool(envKey: string) {
  const val = getEnv(envKey);
  if (val !== undefined && String(val) === "true") {
    return true;
  }
  return false;
}

function getEnvNumber(envKey: string, defaultVal?: number) {
  const val = getEnv(envKey);
  if (val !== undefined && !isNaN(Number(val))) {
    return Number(val);
  }
  return defaultVal as any as number;
}

type IEnvironment = "production" | "staging" | "development" | "test";

export const envConfig = {
  env: getEnvString("NODE_ENV") as IEnvironment,

  port: getEnvNumber("PORT"),

  // remote services

  GOVT_TAX_URL: getEnvString("GOVT_TAX_URL"),
} as const;

export class Env {
  static all() {
    return envConfig;
  }
}
