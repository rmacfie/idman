import * as cryption from "../helpers/cryption";
import * as time from "../helpers/time";
import * as validator from "../helpers/validator";
import config from "../config";
import * as framework from "../framework";
import * as model from "../model";
import * as types from "../types";

export function route(routes: framework.RouteTable) {
  routes.mapResource("POST", `/api/refresh`, async (ctx): Promise<types.RefreshOutput> => {
    const input = ctx.request.body as types.RefreshInput;

    await validator.validate(input, {
      "refreshToken": [
        validator.required(`Refresh token is required`),
      ],
      "device": [
        validator.required(`Device is required`),
      ],
    });

    const session = await model.findSessionByRefresh(input.refreshToken);

    if (!session) {
      throw new framework.ValidationError(`refreshToken`, `exists`, `The refresh token does not exist`);
    }

    if (session.expired) {
      throw new framework.ValidationError(`refreshToken`, `expiration`, `The refresh token is expired`);
    }

    if (session.blocked) {
      throw new framework.ValidationError(`refreshToken`, `blocked`, `The session has been signed out`);
    }

    const account = await model.findAccountById(session.accountId);

    if (account.blocked) {
      throw new framework.HttpError(403, "Account is disabled");
    }

    const nonce = await cryption.randomString(32);
    const login = await model.insertLogin(
      session.id,
      nonce,
      config.loginExpirySeconds,
      input.device,
    );
    const accessToken: types.AccessToken = {
      id: account.id,
      email: account.email,
      aud: config.jwtAudience,
      iss: config.jwtIssuer,
      jti: nonce,
      exp: time.epoch(login.expires),
      iat: time.epoch(login.created),
    };
    return {
      accessToken: await cryption.signJwt(accessToken, config.loginExpirySeconds, nonce),
      issuedAt: accessToken.iat,
      expiresAt: accessToken.exp,
    };
  });
}
