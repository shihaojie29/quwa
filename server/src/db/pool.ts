import mysql, { type Pool } from "mysql2/promise";
import type { DbConfig } from "./config";

export function createPool(config: DbConfig): Pool {
  return mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: config.connectionLimit,
    dateStrings: true,
    namedPlaceholders: false,
  });
}

