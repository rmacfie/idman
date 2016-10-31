import * as express from "express";

export default function (): express.Handler {
  return (req, res, next) => {
    const timerStart = process.hrtime();
    next();
    const timerDelta = process.hrtime(timerStart);
    const elapsedMs = (timerDelta[0] * 1e3) + (timerDelta[1] / 1e6);
    console.log(`[request] ${res.statusCode} ${req.method} ${req.url} (${elapsedMs.toFixed(3)}ms)`);
  };
}
