import * as winston from "winston";
import * as superagent from "superagent";

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
