import { RouteTable } from "../framework";

export interface PingResult {
  status: string;
  version: string;
  timestamp: Date;
}

export default function (routes: RouteTable) {
  routes.mapResource("GET", "/api/ping", async (ctx): Promise<PingResult> => {
    return {
      status: "OK",
      version: "0.0.0",
      timestamp: new Date(),
    };
  });
}
