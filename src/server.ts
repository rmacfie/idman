import * as log from "winston";

log.configure({
  transports: [
    new log.transports.Console(),
  ]
})

const pkg = require("../package.json");
console.log(`# ------------------------------------`);
console.log(`# ${pkg.name} v${pkg.version}`);
console.log(`# ------------------------------------`);

import config from "./config";
import App from "./app";

const app = App();
app.set("port", config.port);
app.listen(config.port, () => {
  log.info(`[server] listening on http://localhost:${config.port}`);
});
