import * as cryption from "../helpers/cryption";
import * as validator from "../helpers/validator";
import config from "../config";
import * as framework from "../framework";
import * as types from "../types";

export function route(routes: framework.RouteTable) {
  routes.mapResource("POST", `/api/verify`, async (ctx): Promise<types.VerifyOutput> => {
    const input = ctx.request.body as types.VerifyInput;

    await validator.validate(input, {
      "accessToken": [
        validator.required(`Access token is required`),
      ],
    });

    let output: types.VerifyOutput;

    try {
      output = await cryption.verifyJwt(input.accessToken, config.jwtIssuer, [config.jwtAudience]);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new framework.ValidationError(`accessToken`, `expiration`, `The token has expired`);
      } else if (err.name === "JsonWebTokenError") {
        throw new framework.ValidationError(`accessToken`, `validation`, `Invalid token`);
      } else {
        throw err;
      }
    }

    return output;
  });
}
