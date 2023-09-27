import { Response, Request } from "express";
import { controller, httpGet, queryParam } from "inversify-express-utils";
import { HTTPStatus } from "../utils/constants";
import { BaseController } from "./BaseController";

@controller("/v1/health")
export class HealthController extends BaseController {
  constructor() {
    super();
  }

  @httpGet("/")
  public basicCheck(
    @queryParam("def__Health_check_route") def: string,
    _: Request,
    res: Response
  ) {
    this.resSuccess({
      res,
      data: [],
      message: "Basic Health Check Route Working.",
      httpStatus: HTTPStatus.OK,
    });
  }
}
