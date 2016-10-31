import { RouteContext } from "../routing";

export interface PingResult {
  status: string;
  version: string;
  timestamp: Date;
}

export async function handle(ctx: RouteContext): Promise<PingResult> {
  return {
    status: "OK",
    version: "0.0.0",
    timestamp: new Date(),
  };
}

// export const route = {
//   method: "GET",
//   path: "/api/ping",
//   handle: async (ctx: RouteContext) => {

//   }
// };

