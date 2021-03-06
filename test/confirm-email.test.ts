import { assert } from "chai";
import * as context from "./context";
import * as types from "../src/types";

describe(`/api/confirm-email`, () => {
  let testRegisterInput: types.RegisterInput;
  let emailConfirmationToken: string;

  beforeEach(async () => {
    testRegisterInput = { email: `test-confirm-email@example.com`, password: `hunter22` };
    await context.cleanAccountByEmail(testRegisterInput.email);
    emailConfirmationToken = (await context.supertester().post(`/api/register`).send(testRegisterInput)).body.emailConfirmationToken;
  });

  it(`returns 200`, async () => {
    const response = await context.supertester().post(`/api/confirm-email`).send({ token: emailConfirmationToken });
    assert.equal(response.status, 200);
  });

  it(`returns 400 when already confirmed`, async () => {
    await context.supertester().post(`/api/confirm-email`).send({ token: emailConfirmationToken });

    const response = await context.supertester().post(`/api/confirm-email`).send({ token: emailConfirmationToken });
    const body = response.body as types.ValidationErrorDto;

    assert.equal(response.status, 400);
    assert.equal(body[`token`][0].code, `exists`);
  });

});
