import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mysql from "mysql2/promise";
import { loadConfig } from "./config";

async function main(): Promise<void> {
  const { db } = loadConfig();
  const sql = await readFile(resolve(process.cwd(), "server/sql/schema.sql"), "utf8");
  const connection = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    multipleStatements: true,
    dateStrings: true,
  });

  try {
    await connection.query(sql);
    console.log("MySQL schema migrated.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

