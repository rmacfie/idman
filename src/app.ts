import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as log from "winston";
import requestLogger from "./middleware/request-logger";
import errorHandler from "./middleware/error-handler";
import notfoundHandler from "./middleware/error-handler";
import { RouteTable } from "./framework";

export default function () {
  const app = express();

  app.use(requestLogger());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(routes());

  app.use(notfoundHandler());
  app.use(errorHandler());

  return app;
}

function routes() {
  const routeTable = new RouteTable();
  const routesPath = path.join(__dirname, "routes");
  fs.readdirSync(routesPath).filter(f => f.endsWith(".js")).forEach(f => {
    require(`./routes/${f}`).route(routeTable);
  });
  return routeTable.middleware();
}
