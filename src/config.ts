import * as log from "winston";
const devenv = tryRequire("../devenv.json") || {};

class Config {
  readonly port = env<number>("PORT", 10001);
  readonly jwtSecret = env<string>("JWT_SECRET", "FW8z1Yw4rVUl2aPm1mIhlN00kqQYqDuVkXuikPtwXiX51eW6iVnNsXpOH4yL9vye");
  readonly postgresUrl = env<string>("POSTGRES_URL", "postgres://idman:idman@localhost/idman");
}

export default new Config();

function env<T>(key: string, fallback?: T): T {
  if (process.env[key]) {
    log.info(`[config] process env: ${key}`);
    return process.env[key] as T;
  } else if (devenv[key]) {
    log.info(`[config]     dev env: ${key}`);
    return devenv[key] as T;
  } else if (fallback) {
    log.info(`[config] default env: ${key}`);
    return fallback;
  } else {
    log.info(`[config]   undefined: ${key}`);
    return <any>undefined;
  }
}

function tryRequire(id: string) {
  try {
    return require(id);
  } catch (err) {
    return undefined;
  }
}
