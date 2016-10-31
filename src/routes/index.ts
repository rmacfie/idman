import * as routing from "../routing";
import * as ping from "./ping";

export default function () {
  const routes = new routing.RouteTable();

  routes.mapResource<ping.PingResult>("GET", "/api/ping", ping.handle);

  return routes.middleware();
}
