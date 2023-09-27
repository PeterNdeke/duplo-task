import { Request, Response } from "express";
import { inject } from "inversify";
import {
  controller,
  httpGet,
  httpPost,
  queryParam,
} from "inversify-express-utils";
import { TYPES } from "../config/types";
import { BaseController } from "./BaseController";
import { TransactionLogsService } from "../services";
import { TransactionLogsCreationSchema } from "../validations/transaction-logs.validators";
import { HTTPStatus } from "../utils/constants";

@controller("/v1/transaction-logs")
export class TransactionLogsController extends BaseController {
  constructor(
    @inject(TYPES.TransactionLogsService)
    private transLogsService: TransactionLogsService
  ) {
    super();
  }

  @httpPost("/")
  public async createTransactionLogs(
    @queryParam("def__create_transaction_logs") def: string,
    req: Request,
    res: Response
  ) {
    try {
      const errors = await this.validateRequest(
        req.body,
        TransactionLogsCreationSchema
      );

      if (errors) {
        return this.resError({
          res,
          code: "VALIDATION_ERRORS",
          message: errors,
          httpStatus: HTTPStatus.VALIDATION_ERROR,
        });
      }
      const transLogs = await this.transLogsService.createTransactionLogs(
        req.body
      );
      return this.resSuccess({
        res,
        data: transLogs,
        message: "Successfully added transaction logs",
        httpStatus: HTTPStatus.CREATED,
      });
    } catch (error) {
      return this.resError({ res, error });
    }
  }

  @httpGet("/")
  public async getAllTransactionLogs(
    @queryParam("def__get_TransactionLogs") def: string,
    @queryParam("page") page: number,
    @queryParam("limit") limit: number,
    @queryParam("businessID") businessID: string,
    req: Request,
    res: Response
  ) {
    try {
      const result = await this.transLogsService.fetchAllTransactionsLogs({
        page: this.getNumberValue(page),
        limit: this.getNumberValue(limit),
        businessID,
      });

      return this.resSuccess({
        res,
        data: result,
        message: "Successfully fetched transaction logs",
      });
    } catch (error) {
      return this.resError({ res, error });
    }
  }

  @httpGet("/credit-score/:businessID")
  public async getCreditScoreForBusiness(
    @queryParam("def__get_BUsiness_Credit_Score") def: string,
    req: Request,
    res: Response
  ) {
    try {
      const businessID = req.params.businessID;
      const result =
        await this.transLogsService.getBusinessCreditScore(businessID);
      return this.resSuccess({
        res,
        data: result,
        message: "Successfull",
      });
    } catch (error) {
      console.log(error);
      return this.resError({ res, error });
    }
  }
  @httpGet("/:businessID/business-order-details")
  public async getAllOrderDetailsForBusiness(
    @queryParam("def__get_All_Order_Details_For_Business") def: string,
    @queryParam("today") today: boolean,
    req: Request,
    res: Response
  ) {
    try {
      const businessID = req.params.businessID;
      const result = await this.transLogsService.getAllOrderDetailsForBusiness({
        today: this.getBooleanValue(today),
        businessID,
      });
      return this.resSuccess({
        res,
        data: result,
        message: "Successfull",
      });
    } catch (error) {
      console.log(error);
      return this.resError({ res, error });
    }
  }
}
