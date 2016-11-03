import { assert } from "chai";
import * as context from "./context";
import * as validator from "../src/helpers/validator";
import * as register from "../src/routes/register";

describe(`/api/register`, () => {
  let testInput: register.Input;

  beforeEach(async () => {
    testInput = { email: `test-register@example.com`, password: `hunter22` };
  });

  describe(`on success`, () => {
    let response: context.Response;
    let body: register.Output;

    beforeEach(async () => {
      await context.cleanAccountByEmail(testInput.email);
      response = await context.supertester().post(`/api/register`).send(testInput);
      body = response.body as register.Output;
    });

    it(`returns status 201`, async () => {
      assert.equal(response.status, 201);
    });

    it(`returns location header`, async () => {
      assert.equal(response.header[`location`], `/api/accounts/${body.id}`);
    });

    it(`returns the new account`, async () => {
      assert.isAtLeast(body.id, 1);
      assert.approximately(new Date(body.created).getTime(), new Date().getTime(), 100);
      assert.equal(body.email, testInput.email);
      assert.isFalse(body.emailConfirmed);
      assert.isOk(body.emailConfirmationToken);
      assert.isFalse(body.blocked);
      assert.isNull(body.blockedReason);
    });
  });

  describe(`when email is already registered`, () => {
    let response: context.Response;
    let body: validator.ViolationCollection;

    beforeEach(async () => {
      await context.cleanAccountByEmail(testInput.email);
      await context.supertester().post(`/api/register`).send(testInput);
      response = await context.supertester().post(`/api/register`).send(testInput);
      body = response.body as validator.ViolationCollection;
    });

    it(`returns status 400`, async () => {
      assert.equal(response.status, 400);
    });

    it(`returns violation info`, async () => {
      assert.equal(body[`email`][0].code, `isEmailAvailable`);
    });
  });

  describe(`when email is not an email address`, () => {
    let response: context.Response;
    let body: validator.ViolationCollection;

    beforeEach(async () => {
      testInput.email = `not_an_email.com`;
      response = await context.supertester().post(`/api/register`).send(testInput);
      body = response.body as validator.ViolationCollection;
    });

    it(`returns status 400`, async () => {
      assert.equal(response.status, 400);
    });

    it(`returns violation info`, async () => {
      assert.equal(body[`email`][0].code, `isEmail`);
    });
  });

  describe(`when email is empty`, () => {
    let response: context.Response;
    let body: validator.ViolationCollection;

    beforeEach(async () => {
      testInput.email = ``;
      response = await context.supertester().post(`/api/register`).send(testInput);
      body = response.body as validator.ViolationCollection;
    });

    it(`returns status 400`, async () => {
      assert.equal(response.status, 400);
    });

    it(`returns violation info`, async () => {
      assert.equal(body[`email`][0].code, `required`);
    });
  });

  describe(`when password is too short`, () => {
    let response: context.Response;
    let body: validator.ViolationCollection;

    beforeEach(async () => {
      testInput.password = `hunte2`;
      response = await context.supertester().post(`/api/register`).send(testInput);
      body = response.body as validator.ViolationCollection;
    });

    it(`returns status 400`, async () => {
      assert.equal(response.status, 400);
    });

    it(`returns violation info`, async () => {
      assert.equal(body[`password`][0].code, `isLength`);
    });
  });

  describe(`when password is empty`, () => {
    let response: context.Response;
    let body: validator.ViolationCollection;

    beforeEach(async () => {
      testInput.password = ``;
      response = await context.supertester().post(`/api/register`).send(testInput);
      body = response.body as validator.ViolationCollection;
    });

    it(`returns status 400`, async () => {
      assert.equal(response.status, 400);
    });

    it(`returns violation info`, async () => {
      assert.equal(body[`password`][0].code, `required`);
    });
  });
});
