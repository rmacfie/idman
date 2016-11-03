import * as cryption from "../helpers/cryption";
import * as validator from "../helpers/validator";
import { RouteTable, ValidationError } from "../framework";
import { VerifyInput, VerifyOutput } from "../types";
import config from "../config";
import * as model from "../model";

export function route(routes: RouteTable) {
  routes.mapResource("POST", `/api/verify`, async (ctx): Promise<VerifyOutput> => {
    const input = ctx.request.body as VerifyInput;

    await validator.validate(input, {
      "accessToken": [
        validator.required(`Access token is required`),
      ],
    });

    let output: VerifyOutput;

    try {
      output = await cryption.verifyJwt(input.accessToken, config.jwtIssuer, [config.jwtAudience]);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ValidationError(`accessToken`, `expiration`, `The token has expired`);
      } else if (err.name === "JsonWebTokenError") {
        throw new ValidationError(`accessToken`, `validation`, `Invalid token`);
      } else {
        throw err;
      }
    }

    return output;
  });
}
