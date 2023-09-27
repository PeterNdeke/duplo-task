import { Response } from "express";
import Joi from "joi";
import { injectable } from "inversify";
import { GenericFriendlyError } from "../utils/errors";
import { LoggingService } from "../utils/logger";
import { FriendlyErrorUtil } from "../utils/error-util";

@injectable()
export abstract class BaseController extends FriendlyErrorUtil {
  protected getBooleanValue(val: unknown): boolean | undefined {
    if (val !== undefined && val !== null) {
      if (typeof val === "string" || typeof val === "boolean") {
        if (String(val).trim() === "true" || String(val).trim() === "false") {
          return String(val).trim() === "true";
        }
      }
    }
    return undefined;
  }

  protected getNumberValue(val: unknown): number | undefined {
    if (val !== undefined && val !== null) {
      if (typeof val === "string" || typeof val === "number") {
        if (!isNaN(Number(val))) {
          return Number(val);
        }
      }
    }
    return undefined;
  }

  protected async validateRequest(
    requestBody: any,
    validationSchema: Joi.Schema
  ) {
    const error = validationSchema.validate(requestBody);

    if (error?.error) {
      return Promise.resolve(
        error?.error?.details?.[0]?.message || "Validation error occured"
      );
    }
    return null;
  }

  protected resSuccess({
    res,
    data,
    message = "",
    httpStatus = 200,
  }: {
    res: Response;
    data: any;
    message?: string;
    httpStatus?: number;
  }) {
    return res.status(httpStatus).json({
      status: "success",
      message: message,
      data: data,
    });
  }

  protected resError({
    res,
    code,
    message,
    error,
    httpStatus = 400,
  }: {
    res: Response;
    code?: string;
    message?: string;
    error?: any;
    httpStatus?: number;
  }) {
    if (message) {
      LoggingService.error(message);
    }

    if (error) {
      LoggingService.error(error);
    }

    if (!error) {
      return res.status(httpStatus || 500).send({
        status: "error",
        code: httpStatus || code,
        message: message || "Error occured",
      });
    }

    const errorData = this.getFriendlyErrorMessage(error);

    const httpStatus01 = errorData.httpStatus || httpStatus || 500;
    const message01 = message || errorData.message || "Error occured";
    const code01 = errorData.code || code || 0;
    return res.status(httpStatus01).send({
      status: "error",
      code: httpStatus01 || code01,
      message: message01,
    });
  }
}

export function getErrorMessage(errorMsg: unknown) {
  const msgOrError: string = "Unknow Error";

  if (errorMsg instanceof GenericFriendlyError) {
    return {
      message: errorMsg.message,
      httpStatus: errorMsg.httpStatus,
      code: errorMsg.code,
    };
  }

  return {
    message: msgOrError,
    httpStatus: undefined,
    code: undefined,
  };
}
