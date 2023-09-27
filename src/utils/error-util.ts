import { injectable } from "inversify";
import validator from "validator";
import { DateService } from "./date-service";
import { GenericFriendlyError } from "./errors";
import { getErrorMessage } from "../controllers/BaseController";

@injectable()
export class FriendlyErrorUtil {
  protected createFriendlyError(message: string, httpStatus = 400) {
    return new GenericFriendlyError(message, httpStatus);
  }
  protected getFriendlyErrorMessage(err: unknown) {
    return getErrorMessage(err);
  }
  protected validateRequiredString(keyValueValidates: {
    [key: string]: string | undefined | null;
  }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && typeof value === "string")) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  protected validateRequiredUUID(keyValueValidates: {
    [key: string]: string | undefined | null;
  }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates).forEach(([key, value]) => {
      if (!(value && validator.isUUID(value))) {
        errors.push(`${key} MUST be valid uuid`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  protected validateRequiredNumber(keyValueValidates: {
    [key: string]: number | undefined | null;
  }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates || {}).forEach(([key, value]) => {
      if (!(!isNaN(Number(value)) && typeof value === "number")) {
        errors.push(`${key} is required`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }

  protected validateDayStamp_YYYY_MM_DD(keyValueValidates: {
    [key: string]: string | undefined | null;
  }) {
    const errors: string[] = [];
    Object.entries(keyValueValidates || {}).forEach(([key, value]) => {
      if (!(value && DateService.isValidFormat_YYYY_MM_DD(value))) {
        errors.push(`${key} must be valid date format: YYYY-MM-DD`);
      }
    });
    if (errors.length) {
      throw this.createFriendlyError(`${errors.join("; ")}.`);
    }
  }
}
