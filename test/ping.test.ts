import { assert } from "chai";
import { supertester } from "./abstract";

describe("/api/ping:", () => {

  it("returns ping result", async () => {
    const now = new Date();
    const res = await supertester().get("/api/ping");

    assert.equal(res.status, 200);
    assert.equal(res.body.status, "OK");
    assert.approximately(new Date(res.body.timestamp).getTime(), new Date().getTime(), 100);
    assert.equal(res.body.version, "0.0.0");
  });

});
