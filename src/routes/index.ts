import * as routing from "../framework";
import ping from "./ping";

export default function () {
  const routes = new routing.RouteTable();
  ping(routes);
  return routes.middleware();
}
