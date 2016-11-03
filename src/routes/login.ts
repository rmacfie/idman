import * as cryption from "../helpers/cryption";
import * as time from "../helpers/time";
import * as validator from "../helpers/validator";
import config from "../config";
import { RouteTable, HttpError, ValidationError } from "../framework";
import { LoginInput, LoginOutput, SessionType, AccessToken } from "../types";
import * as model from "../model";

export function route(routes: RouteTable) {
  routes.mapResource("POST", "/api/login", async (ctx): Promise<LoginOutput> => {
    const input = ctx.request.body as LoginInput;

    await validator.validate(input, {
      "email": [
        validator.required("Email is required"),
      ],
      "password": [
        validator.required("Password is required"),
      ],
      "type": [
        validator.required("Type is required"),
        validator.isOneOf<SessionType>(["cookie"], "Type must be 'cookie'"),
      ],
    });

    const account = await model.findAccountByCredentials(input.email, input.password);

    if (!account) {
      throw new ValidationError(`*`, `credentials`, `Email and password did not match any account`);
    }
    if (!account.emailConfirmed) {
      throw new ValidationError(`*`, `emailConfirmation`, `The account is not activated yet`);
    }
    if (account.blocked) {
      throw new HttpError(403, `The account is disabled`);
    }

    const refreshToken = await cryption.randomString(32);
    const loginNonce = await cryption.randomString(32);
    const sessionAndLogin = await model.insertSessionAndLogin(
      account.id,
      refreshToken,
      config.sessionExpirySeconds,
      input.type,
      input.device,
      loginNonce,
      config.loginExpirySeconds,
    );
    const accessToken: AccessToken = {
      id: account.id,
      email: account.email,
      aud: config.jwtAudience,
      iss: config.jwtIssuer,
      jti: loginNonce,
      exp: time.epoch(sessionAndLogin.login.expires),
      iat: time.epoch(sessionAndLogin.login.created),
    };
    return {
      accessToken: await cryption.signJwt(accessToken, config.loginExpirySeconds, loginNonce),
      refreshToken: sessionAndLogin.session.refresh,
      issuedAt: accessToken.iat,
      expiresAt: accessToken.exp,
    };
  });
}
