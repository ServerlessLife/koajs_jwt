import * as mysql from 'promise-mysql-native';
import { config } from '../config';

let pool: mysql.Pool;

const dbConfig = {
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName
};

export async function getConnectionFromPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }

  const connection = pool.getConnection();

  return await connection;
}

export async function getSingleConnection(config: mysql.ConnectionConfig) {
  return mysql.createConnection({ ...dbConfig, ...config });
}

export async function closePool() {
  pool.end();
}
