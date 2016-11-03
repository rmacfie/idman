import { assert } from "chai";
import * as context from "./context";
import * as types from "../src/types";

describe(`/api/signout`, () => {
  let input: types.SignoutInput;

  beforeEach(async () => {
    input = <any>{};
  });

  it(`returns 200`, async () => {
    const signinInput: types.SigninInput = {
      email: `test-signout@example.com`,
      password: `hunter22`,
      type: "cookie",
      device: `Test (Signout)`,
    };
    await context.cleanAccountByEmail(signinInput.email);
    const registerInput: types.RegisterInput = { email: signinInput.email, password: signinInput.password };
    const registerOutput: types.RegisterOutput = (await context.supertester().post(`/api/register`).send(registerInput)).body;
    const confirmEmailInput: types.ConfirmEmailInput = { token: registerOutput.emailConfirmationToken };
    await context.supertester().post(`/api/confirm-email`).send(confirmEmailInput);
    const signinOutput: types.SigninOutput = (await context.supertester().post(`/api/signin`).send(signinInput)).body;
    input = {
      refreshToken: signinOutput.refreshToken,
    };
    const response = await context.supertester().post(`/api/signout`).send(input);

    assert.equal(response.status, 200);
  });

  it(`returns 400 when refreshToken is empty`, async () => {
    input.refreshToken = ``;
    const response = await context.supertester().post(`/api/signout`).send(input);
    const body = response.body as types.ValidationErrorDto;

    assert.equal(response.status, 400);
    assert.equal(body[`refreshToken`][0].code, `required`);
  });

  it(`returns 400 when refreshToken does not exist`, async () => {
    input.refreshToken = `some_token_that_does_not_exist`;
    const response = await context.supertester().post(`/api/signout`).send(input);
    const body = response.body as types.ValidationErrorDto;

    assert.equal(response.status, 400);
    assert.equal(body[`refreshToken`][0].code, `exists`);
  });
});
