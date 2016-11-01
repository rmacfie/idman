import * as winston from "winston";

winston.configure({
  transports: [
    new winston.transports.Console({ level: "error" })
  ]
});

import * as supertestAsPromised from "supertest-as-promised";
import App from "../src/app";

export function supertester() {
  return supertestAsPromised(App());
}
