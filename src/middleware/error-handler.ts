import * as express from "express";
import * as log from "winston";
import { HttpError, ValidationError } from "../framework";

export default function (): express.ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof ValidationError) {
      res.status(400);
      res.json(err.error);
    } else if (err instanceof HttpError) {
      res.status(err.status);
      res.send(err.message);
    } else {
      log.error(`[error-handler]`, err);
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err,
      });
    }
  };
}
