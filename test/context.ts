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

export async function cleanAccountByEmail(email: string): Promise<void> {
  await postgres.execute(
    `DELETE FROM logins l
      WHERE l.sessionid IN (
        SELECT s.id
        FROM sessions s
        INNER JOIN accounts a ON s.accountid = a.id
        WHERE lower(a.data->>'email') = $1
      )`,
    [email]
  );
  await postgres.execute(
    `DELETE FROM sessions s
      WHERE s.accountid IN (
        SELECT a.id
        FROM accounts a
        WHERE lower(a.data->>'email') = $1
      )`,
    [email]
  );
  await postgres.execute(
    `DELETE FROM accounts a
      WHERE lower(a.data->>'email') = $1`,
    [email]
  );
}
