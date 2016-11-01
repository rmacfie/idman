import * as express from "express";
import { HttpError } from "../framework";

export default function (): express.RequestHandler {
  return (req, res, next) => {
    next(new HttpError(404, "Not Found"));
  };
}
