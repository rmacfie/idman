const pkg = require("../package.json");

console.log(`# ------------------------------------`);
console.log(`# ${pkg.name} v${pkg.version}`);
console.log(`# ------------------------------------`);

import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import requestLogger from "./middleware/request-logger";
import errorHandler from "./middleware/error-handler";
import config from "./config";
import { HttpError, RouteTable } from "./framework";

const app = express();

app.use(requestLogger());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = new RouteTable();
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).filter(f => f.endsWith(".js")).forEach(f => {
  console.log(`[app] loading routes from ${f}`);
  require(`./routes/${f}`).default(routes);
});
app.use(routes.middleware());

app.use((req, res, next) => {
  next(new HttpError(404, "Not Found"));
});

app.use(errorHandler());

app.set("port", config.port);
app.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`);
});
