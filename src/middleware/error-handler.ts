import * as express from "express";
import { HttpError } from "../routing";

export default function (): express.ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof HttpError) {
      res.status(err.status);
      res.send(err.message);
    } else {
      next(err);
    }
  };
}
