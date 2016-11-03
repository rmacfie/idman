import * as express from "express";
import * as log from "winston";

export default function (): express.Handler {
  return (req, res, next) => {
    const timerStart = process.hrtime();

    res.on(`finish`, () => {
      const timerDelta = process.hrtime(timerStart);
      const elapsedMs = (timerDelta[0] * 1e3) + (timerDelta[1] / 1e6);
      log.info(`[request] ${res.statusCode} ${req.method} ${req.url} (${elapsedMs.toFixed(3)}ms)`);
    });

    next();
  };
}
