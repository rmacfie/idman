import config from "../config";
import { RouteTable } from "../framework";

const version = require("../../package.json").version;

export interface Output {
  status: string;
  version: string;
  timestamp: Date;
}

export function route(routes: RouteTable) {
  routes.mapResource("GET", "/api/ping", async (ctx): Promise<Output> => {
    return {
      status: "OK",
      version: version,
      timestamp: new Date(),
    };
  });
}
