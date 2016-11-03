import { assert } from "chai";
import * as context from "./context";

describe(`/api/ping`, () => {

  it(`returns ping result`, async () => {
    const response = await context.supertester().get(`/api/ping`);

    assert.equal(response.status, 200);
    assert.equal(response.body.status, `OK`);
    assert.approximately(new Date(response.body.timestamp).getTime(), new Date().getTime(), 100);
    assert.equal(response.body.version, `0.0.0`);
  });

});
