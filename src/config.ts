const devenv = tryRequire("../devenv.json") || {};

class Config {
  readonly port = env<number>("PORT", 10001);
}

export default new Config();

function env<T>(key: string, fallback?: T): T {
  if (process.env[key]) {
    console.log(`[config] process env: ${key}`);
    return process.env[key] as T;
  } else if (devenv[key]) {
    console.log(`[config]     dev env: ${key}`);
    return devenv[key] as T;
  } else if (fallback) {
    console.log(`[config] default env: ${key}`);
    return fallback;
  } else {
    console.log(`[config]   undefined: ${key}`);
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
