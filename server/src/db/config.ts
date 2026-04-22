import "dotenv/config";

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

export interface ServerConfig {
  port: number;
  db: DbConfig;
}

function numberFromEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric env var ${name}: ${value}`);
  }

  return parsed;
}

export function loadConfig(): ServerConfig {
  return {
    port: numberFromEnv("SERVER_PORT", 3000),
    db: {
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: numberFromEnv("MYSQL_PORT", 3306),
      user: process.env.MYSQL_USER ?? "root",
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE ?? "quwa",
      connectionLimit: numberFromEnv("MYSQL_CONNECTION_LIMIT", 10),
    },
  };
}

