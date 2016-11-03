import * as validator from "../helpers/validator";
import * as framework from "../framework";
import * as model from "../model";
import * as types from "../types";

export function route(routes: framework.RouteTable) {
  routes.mapResource("POST", `/api/signout`, async (ctx): Promise<void> => {
    const input = ctx.request.body as types.SignoutInput;

    await validator.validate(input, {
      "refreshToken": [
        validator.required(`Refresh token is required`),
      ],
    });

    const session = await model.findSessionByRefresh(input.refreshToken);

    if (!session) {
      throw new framework.ValidationError(`refreshToken`, `exists`, `The refresh token does not exist`);
    }

    if (session.blocked) {
      return;
    }

    await model.updateSessionBlocked(session.id, `signout`);
  });
}
