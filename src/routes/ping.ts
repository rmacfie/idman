import config from "../config";
import { RouteTable } from "../framework";
import { PingOutput } from "../types";

const version = require("../../package.json").version;

export function route(routes: RouteTable) {
  routes.mapResource("GET", "/api/ping", async (ctx): Promise<PingOutput> => {
    return {
      status: "OK",
      version: version,
      timestamp: new Date(),
    };
  });
}
