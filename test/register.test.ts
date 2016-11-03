import { assert } from "chai";
import * as context from "./context";
import { RegisterInput, RegisterOutput, ValidationErrorDto } from "../src/types";

describe(`/api/register`, () => {
  let testInput: RegisterInput;

  beforeEach(async () => {
    testInput = { email: `test-register@example.com`, password: `hunter22` };
  });

  describe(`on success`, () => {
    it(`returns 200`, async () => {
      await context.cleanAccountByEmail(testInput.email);

      const response = await context.supertester().post(`/api/register`).send(testInput);
      const body = response.body as RegisterOutput;

      assert.equal(response.status, 201);
      assert.equal(response.header[`location`], `/api/accounts/${body.id}`);

      assert.isAtLeast(body.id, 1);
      assert.approximately(new Date(body.created).getTime(), new Date().getTime(), 100);
      assert.equal(body.email, testInput.email);
      assert.isFalse(body.emailConfirmed);
      assert.isOk(body.emailConfirmationToken);
      assert.isFalse(body.blocked);
      assert.isNull(body.blockedReason);
    });
  });

  describe(`on error`, () => {
    it(`returns 400 when email is already registered`, async () => {
      await context.cleanAccountByEmail(testInput.email);
      await context.supertester().post(`/api/register`).send(testInput);

      const response = await context.supertester().post(`/api/register`).send(testInput);
      const body = response.body as ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`email`][0].code, `isEmailAvailable`);
    });

    it(`returns 400 when email is not an email address`, async () => {
      testInput.email = `not_an_email.com`;

      const response = await context.supertester().post(`/api/register`).send(testInput);
      const body = response.body as ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`email`][0].code, `isEmail`);
    });

    it(`returns 400 when email is empty`, async () => {
      testInput.email = ``;

      const response = await context.supertester().post(`/api/register`).send(testInput);
      const body = response.body as ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`email`][0].code, `required`);
    });

    it(`returns 400 when password is too short`, async () => {
      testInput.password = `hunte2`;

      const response = await context.supertester().post(`/api/register`).send(testInput);
      const body = response.body as ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`password`][0].code, `isLength`);
    });

    it(`returns 400 when password is empty`, async () => {
      testInput.password = ``;

      const response = await context.supertester().post(`/api/register`).send(testInput);
      const body = response.body as ValidationErrorDto;

      assert.equal(response.status, 400);
      assert.equal(body[`password`][0].code, `required`);
    });
  });

});
