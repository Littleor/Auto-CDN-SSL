import mysql, { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { env } from "../config/env";

export type DbStatement = {
  run: (...params: any[]) => Promise<ResultSetHeader>;
  get: <T = RowDataPacket>(...params: any[]) => Promise<T | undefined>;
  all: <T = RowDataPacket>(...params: any[]) => Promise<T[]>;
};

export type Db = {
  prepare: (sql: string) => DbStatement;
  exec: (sql: string) => Promise<void>;
};

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  pool = mysql.createPool({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    connectionLimit: 10,
    multipleStatements: true,
    dateStrings: true
  });
  return pool;
}

export function getDb(): Db {
  const activePool = getPool();
  return {
    prepare: (sql: string) => ({
      run: async (...params: any[]) => {
        const [result] = await activePool.execute<ResultSetHeader>(sql, params);
        return result;
      },
      get: async <T = RowDataPacket>(...params: any[]) => {
        const [rows] = await activePool.execute<RowDataPacket[]>(sql, params);
        return (rows as T[])[0];
      },
      all: async <T = RowDataPacket>(...params: any[]) => {
        const [rows] = await activePool.execute<RowDataPacket[]>(sql, params);
        return rows as T[];
      }
    }),
    exec: async (sql: string) => {
      await activePool.query(sql);
    }
  };
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
