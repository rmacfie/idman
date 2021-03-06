import * as express from "express";
import * as log from "winston";
import { ValidationErrorDto } from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class HttpError extends Error {
  constructor(public status: number, message?: string) {
    super();
    this.message = message || "";
  }
}

export class ValidationError extends Error {
  error: ValidationErrorDto;

  constructor(dto: ValidationErrorDto);
  constructor(key: string, code: string, message: string);
  constructor(a1: any, a2?: any, a3?: any) {
    super("Validation failed");
    if (typeof a1 === "object" && a2 === undefined && a3 === undefined) {
      this.error = a1;
    } else if (typeof a1 === "string" && typeof a2 === "string" && typeof a3 === "string") {
      this.error = {};
      this.error[a1] = [{ code: a2, message: a3 }];
    }
  }
}

export interface Request extends express.Request {
}

export interface Response extends express.Response {
}

export interface RouteContext {
  request: Request;
  response: Response;
}

export type RoutePath = string | RegExp;

export interface RouteHandler {
  (ctx: RouteContext): Promise<any>;
}

export interface RouteResourceHandler<TRequestBody, TResponseBody> {
  (ctx: RouteContext, requestBody?: TRequestBody): Promise<TResponseBody>;
}

export class RouteTable {
  private router = express.Router();

  mapResource<TResponseBody>(method: HttpMethod, path: RoutePath, handler: RouteResourceHandler<any, TResponseBody>): void;
  mapResource<TRequestBody, TResponseBody>(method: HttpMethod, path: RoutePath, handler: RouteResourceHandler<TRequestBody, TResponseBody>): void {
    this.map(method, path, async ctx => {
      const resource = await handler(ctx, ctx.request.body);
      if (resource !== null && typeof resource === "object") {
        ctx.response.json(resource);
      } else {
        ctx.response.send(resource);
      }
    });
  }

  map(method: HttpMethod, path: RoutePath, handler: RouteHandler): void {
    const expressHandler: express.RequestHandler = (req, res, next) => {
      const ctx = this.createContext(req, res);
      handler(ctx).catch(next);
    };
    log.info(`[routes] mapping ${method} ${path}`);
    switch (method) {
      case "GET":
        this.router.get(path, expressHandler);
        break;
      case "POST":
        this.router.post(path, expressHandler);
        break;
      case "PUT":
        this.router.put(path, expressHandler);
        break;
      case "DELETE":
        this.router.delete(path, expressHandler);
        break;
      default:
        throw new Error(`Unknown HttpMethod '${method}'`);
    }
  }

  middleware(): express.Handler {
    return this.router;
  }

  private createContext(req: express.Request, res: express.Response): RouteContext {
    return {
      request: req as Request,
      response: res as Response,
    };
  }
}
