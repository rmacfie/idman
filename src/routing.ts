import * as express from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class HttpError extends Error {
  constructor(public status: number, message?: string) {
    super();
    this.message = message || "";
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

export interface RouteHandler {
  (ctx: RouteContext): Promise<any>;
}

export interface RouteResourceHandler<TRequestBody, TResponseBody> {
  (ctx: RouteContext, requestBody?: TRequestBody): Promise<TResponseBody>;
}

export type RoutePath = string | RegExp;

export class RouteTable {
  private expressRouter = express.Router();

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
    switch (method) {
      case "GET":
        this.expressRouter.get(path, expressHandler);
        break;
      case "POST":
        this.expressRouter.post(path, expressHandler);
        break;
      case "PUT":
        this.expressRouter.put(path, expressHandler);
        break;
      case "DELETE":
        this.expressRouter.delete(path, expressHandler);
        break;
      default:
        throw new Error(`Unknown HttpMethod '${method}'`);
    }
  }

  middleware(): express.Handler {
    return this.expressRouter;
  }

  private createContext(req: express.Request, res: express.Response): RouteContext {
    return {
      request: req as Request,
      response: res as Response,
    };
  }
}
