import { assert } from "chai";
import { supertester, Response } from "./abstract";
import * as postgres from "../src/helpers/postgres";
import * as register from "../src/routes/register";
import * as validator from "../src/helpers/validator";

describe(`/api/register`, () => {
  const someEmailAddress = `test@example.com`;
  const somePassword = `hunter22`;

  describe(`on success`, () => {
    let response: Response;
    let body: register.Output;

    before(async () => {
      await postgres.execute(`DELETE FROM accounts WHERE data->>'email' = '${someEmailAddress}'`);
      response = await supertester().post(`/api/register`).send({ email: someEmailAddress, password: somePassword });
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
      assert.equal(body.email, someEmailAddress);
      assert.isFalse(body.emailConfirmed);
      assert.isOk(body.emailConfirmationToken);
      assert.isFalse(body.blocked);
      assert.isNull(body.blockedReason);
    });
  });

  describe(`when email is already registered`, () => {
    let response: Response;
    let body: validator.ViolationCollection;

    before(async () => {
      await postgres.execute(`DELETE FROM accounts WHERE data->>'email' = '${someEmailAddress}'`);
      await supertester().post(`/api/register`).send({ email: someEmailAddress, password: somePassword });
      response = await supertester().post(`/api/register`).send({ email: someEmailAddress, password: somePassword });
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
    let response: Response;
    let body: validator.ViolationCollection;

    before(async () => {
      response = await supertester().post(`/api/register`).send({ email: `not_an_email.com`, password: somePassword });
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
    let response: Response;
    let body: validator.ViolationCollection;

    before(async () => {
      response = await supertester().post(`/api/register`).send({ email: ``, password: somePassword });
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
    let response: Response;
    let body: validator.ViolationCollection;

    before(async () => {
      response = await supertester().post(`/api/register`).send({ email: someEmailAddress, password: `hunte2` });
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
    let response: Response;
    let body: validator.ViolationCollection;

    before(async () => {
      response = await supertester().post(`/api/register`).send({ email: someEmailAddress, password: `` });
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
