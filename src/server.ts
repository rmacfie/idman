import * as express from "express";
import requestLogger from "./middleware/request-logger";
import errorHandler from "./middleware/error-handler";
import routes from "./routes";

const app = express();

app.use(requestLogger());
app.use(routes());
app.use(errorHandler());

app.listen(10001, () => {
  console.log(`Listening on port 10001`);
});
