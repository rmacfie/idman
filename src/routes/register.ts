import { RouteTable } from "../framework";
import { RegisterInput, RegisterOutput } from "../types";
import * as cryption from "../helpers/cryption";
import * as validator from "../helpers/validator";
import * as model from "../services/model";

export function route(routes: RouteTable) {
  routes.mapResource("POST", "/api/register", async (ctx): Promise<RegisterOutput> => {
    const input = ctx.request.body as RegisterInput;

    await validator.validate(input, {
      "email": [
        validator.required("Email is required"),
        validator.isEmail("Email must be a valid email adress"),
        validator.custom(`isEmailAvailable`, `Email is already registered`, isEmailAvailable),
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
