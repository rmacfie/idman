import * as validator from "../helpers/validator";
import { RouteTable, ValidationError } from "../framework";
import { ConfirmEmailInput } from "../types";
import * as model from "../model";

export function route(routes: RouteTable) {
  routes.mapResource("POST", `/api/confirm-email`, async (ctx): Promise<void> => {
    const input = ctx.request.body as ConfirmEmailInput;

    await validator.validate(input, {
      "token": [
        validator.required(`Token is required`),
      ],
    });

    if (!await model.updateAccountConfirmEmail(input.token)) {
      throw new ValidationError(`token`, `exists`, `Token does not exist or is already confirmed`)
    }
  });
}
