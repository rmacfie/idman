import * as url from "url";
import * as pg from "pg";
import config from "../config";

pg.types.setTypeParser(20, val => {
  const n = +val;
  if ("" + n != val) {
    throw new Error(`Cannot parse ${val} to an integer because it is too big`);
  }
  return n;
});

const pool = createPool(config.postgresUrl);

/**
 * Describes the valid parameter types for SQL queries
 */
export type Parameter = number | string | boolean | Date | Object;

/**
 * Executes the SQL statement and returns the number of affected rows.
 */
export function execute(sql: string, parameters?: Parameter[]): Promise<number> {
  return transform(sql, parameters, result => result.rowCount);
}

/**
 * Executes the SQL statement and returns the first row in the result
 */
export function first<T>(sql: string, parameters?: Parameter[]): Promise<T> {
  return transform<T[]>(sql, parameters, result => result.rows.length > 0 ? result.rows[0] : undefined);
}

/**
 * Executes the SQL statement and returns the resulting rows
 */
export function query<T>(sql: string, parameters?: Parameter[]): Promise<T[]> {
  return transform<T[]>(sql, parameters, result => result.rows);
}

function createPool(connectionString: string) {
  const urlParams = url.parse(connectionString);
  const urlAuth = urlParams.auth.split(":");
  return new pg.Pool({
    user: urlAuth[0],
    password: urlAuth[1],
    host: urlParams.hostname,
    port: parseInt(urlParams.port),
    database: urlParams.pathname.split("/")[1],
    ssl: false,
  });
}

function transform<T>(sql: string, parameters: Parameter[] | undefined, transform: (result: pg.QueryResult) => T): Promise<T> {
  return new Promise((resolve, reject) => {
    pool.query(sql, parameters || [])
      .then(result => {
        const transformed = transform(result);
        resolve(transformed);
      })
      .catch(reject);
  });
}
