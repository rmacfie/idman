import * as express from "express";
import { HttpError } from "../framework";

export default function (): express.ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof HttpError) {
      res.status(err.status);
      res.send(err.message);
    } else {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err,
      });
    }
  };
}
