import * as cryption from "../helpers/cryption";
import * as validator from "../helpers/validator";
import * as framework from "../framework";
import * as model from "../model";
import * as types from "../types";

export function route(routes: framework.RouteTable) {
  routes.mapResource("POST", "/api/register", async (ctx): Promise<types.RegisterOutput> => {
    const input = ctx.request.body as types.RegisterInput;

    await validator.validate(input, {
      "email": [
        validator.required("Email is required"),
        validator.isEmail("Email must be a valid email adress"),
        validator.custom(`emailAvailability`, `Email is already registered`, isEmailAvailable),
      ],
      "password": [
        validator.required("Password is required"),
        validator.isLength(7, 256, "Password must be at least 7 characters long"),
      ]
    });

    const emailConfirmationToken = await cryption.randomString(32);
    const account = await model.insertAccount(input.email, input.password, emailConfirmationToken);

    ctx.response.status(201);
    ctx.response.setHeader(`Location`, `/api/accounts/${account.id}`);
    return account;
  });
}

async function isEmailAvailable(email: string): Promise<boolean> {
  return !email || await model.isEmailAvailable(email);
}
