import { assert } from "chai";
import * as context from "./context";
import * as types from "../src/types";

describe(`/api/signin`, () => {
  let input: types.SigninInput;
  let emailConfirmationToken: string;

  beforeEach(async () => {
    input = {
      email: `test-signin@example.com`,
      password: `hunter22`,
      type: "cookie",
      device: `Test (Signin)`,
    };
    await context.cleanAccountByEmail(input.email);
    const registerInput: types.RegisterInput = { email: input.email, password: input.password };
    const registerOutput: types.RegisterOutput = (await context.supertester().post(`/api/register`).send(registerInput)).body;
    emailConfirmationToken = registerOutput.emailConfirmationToken;
  });

  it(`returns 400 when email is not confirmed`, async () => {
    const response = await context.supertester().post(`/api/signin`).send(input);
    const body = response.body as types.ValidationErrorDto;

    assert.equal(response.status, 400);
    assert.equal(body[`*`][0].code, `emailConfirmation`);
  });

  describe(`with confirmed email`, () => {
    beforeEach(async () => {
      const confirmEmailInput: types.ConfirmEmailInput = { token: emailConfirmationToken };
      await context.supertester().post(`/api/confirm-email`).send(confirmEmailInput);
    });

    it(`returns 200`, async () => {
      const response = await context.supertester().post(`/api/signin`).send(input);

      assert.equal(response.status, 200);
    });

    it(`returns 400 when email is wrong`, async () => {
      input.email = `some-email-that-does-not-exist@example.com`;
      const response = await context.supertester().post(`/api/signin`).send(input);
      const body = response.body as types.ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`*`][0].code, `credentials`);
    });

    it(`returns 400 when password is wrong`, async () => {
      input.password = `the_wrong_passw0rd`;
      const response = await context.supertester().post(`/api/signin`).send(input);
      const body = response.body as types.ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`*`][0].code, `credentials`);
    });

    it(`returns 400 when email is empty`, async () => {
      input.email = ``;
      const response = await context.supertester().post(`/api/signin`).send(input);
      const body = response.body as types.ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`email`][0].code, `required`);
    });

    it(`returns 400 when password is empty`, async () => {
      input.password = ``;
      const response = await context.supertester().post(`/api/signin`).send(input);
      const body = response.body as types.ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`password`][0].code, `required`);
    });
  });

});
