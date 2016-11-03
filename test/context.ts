import * as winston from "winston";
import * as superagent from "superagent";
import * as postgres from "../src/helpers/postgres";

winston.configure({
  transports: [
    new winston.transports.Console({ level: "error" })
  ]
});

import * as supertestAsPromised from "supertest-as-promised";
import App from "../src/app";

export interface Response extends superagent.Response {
}

export function supertester(): supertestAsPromised.SuperTest<supertestAsPromised.Test> {
  return (<any>supertestAsPromised)(Promise)(App());
}

export async function cleanAccountByEmail(email: string): Promise<boolean> {
  const affectedRows = await postgres.execute(`DELETE FROM accounts WHERE lower(data->>'email') = $1`, [email]);
  return affectedRows > 0;
}
