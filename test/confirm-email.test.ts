import { assert } from "chai";
import * as context from "./context";
import * as validator from "../src/helpers/validator";
import * as register from "../src/routes/register";

describe(`/api/confirm-email`, () => {
  const testRegisterInput: register.Input = {
    email: `test-confirm-email@example.com`,
    password: `hunter22`,
  };

  let token: string;

  beforeEach(async () => {
    await context.cleanAccountByEmail(testRegisterInput.email);
    token = (await context.supertester().post(`/api/register`).send(testRegisterInput)).body.emailConfirmationToken;
  });

  describe(`on success`, () => {
    let response: context.Response;

    beforeEach(async () => {
      response = await context.supertester().post(`/api/confirm-email`).send({ token: token });
    });

    it(`returns status 200`, async () => {
      assert.equal(response.status, 200);
    });
  });

  describe(`on duplicate call`, () => {
    let response: context.Response;
    let body: validator.ViolationCollection;

    before(async () => {
      await context.supertester().post(`/api/confirm-email`).send({ token: token });
      response = await context.supertester().post(`/api/confirm-email`).send({ token: token });
      body = response.body as validator.ViolationCollection;
    });

    it(`returns status 400`, async () => {
      assert.equal(response.status, 400);
    });

    it(`returns violation info`, async () => {
      assert.equal(body[`token`][0].code, `exists`);
    });
  });

});
