import { RouteTable } from "../framework";
import * as validator from "../helpers/validator";
import * as model from "../services/model";

export interface Input {
  token: string;
}

export function route(routes: RouteTable) {
  routes.mapResource("POST", `/api/confirm-email`, async (ctx): Promise<void> => {
    const input = ctx.request.body as Input;

    await validator.validate(input, {
      "token": [
        validator.required(`Token is required`),
      ],
    });

    if (!await model.updateAccountConfirmEmail(input.token)) {
      throw new validator.ValidationError(`token`, `exists`, `Token does not exist or is already confirmed`)
    }
  });
}
