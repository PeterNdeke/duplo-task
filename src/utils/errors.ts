import { HTTPStatus } from './constants';

export class GenericFriendlyError extends Error {
  readonly httpStatus: number;
  readonly code: string | number;

  constructor(errorOption: IGenericFriendlyErrorParams | string | Error, httpStatus?: number, code?: string | number) {
    super(resolveErrorParams({ errorOption }).message);
    const { httpStatus: status01, code: code01 } = resolveErrorParams({
      errorOption,
      httpStatusX: httpStatus,
      codeX: code,
    });
    this.httpStatus = status01;
    this.code = code01;
  }

  static fromError({ error, httpStatus, code }: IGenericFriendlyErrorParams) {
    return new GenericFriendlyError({ error, httpStatus, code });
  }

  static create(msg: string, httpStatus = HTTPStatus.BAD_REQUEST) {
    return new GenericFriendlyError(msg, httpStatus);
  }

  static throwNew(msg: string, httpStatus: HTTPStatus) {
    throw new GenericFriendlyError(msg, httpStatus);
  }

  static createUnAuthorizedError(msg: string) {
    return new GenericFriendlyError(msg, HTTPStatus.UNAUTHORIZED_ERROR);
  }

  static createBadRequestError(msg: string) {
    return new GenericFriendlyError(msg, HTTPStatus.BAD_REQUEST);
  }

  static createNotFoundError(msg: string) {
    return new GenericFriendlyError(msg, HTTPStatus.NOT_FOUND);
  }

  static createValidationError(msg: string) {
    return new GenericFriendlyError(msg, HTTPStatus.VALIDATION_ERROR);
  }
}

export class BadRequestError extends GenericFriendlyError {
  constructor(readonly message: string) {
    super(message, HTTPStatus.BAD_REQUEST);
  }
}

export class UnAuthorizedError extends GenericFriendlyError {
  constructor(readonly message: string) {
    super(message, HTTPStatus.UNAUTHORIZED_ERROR);
  }
}

export type IGenericFriendlyErrorParams = {
  error: string | Error;
  httpStatus?: number;
  code?: string | number;
  subject?: string;
};

function resolveErrorParams({
  errorOption,
  httpStatusX,
  codeX,
}: {
  errorOption: IGenericFriendlyErrorParams | string | Error;
  httpStatusX?: number;
  codeX?: string | number;
}) {
  let message: string = 'Unknown Error';
  let httpStatus: number = httpStatusX || 500;
  let code: string | number = codeX || 'E000';
  if (typeof errorOption === 'string') {
    message = errorOption;
  } else if (errorOption instanceof Error) {
    message = errorOption.message;
  } else if (typeof errorOption === 'object') {
    if (errorOption.error instanceof Error) {
      message = errorOption.error.message;
    } else if (typeof errorOption.error === 'string') {
      message = errorOption.error;
    }
    if (errorOption?.httpStatus) {
      httpStatus = errorOption?.httpStatus;
    }
    if (errorOption?.code) {
      code = errorOption?.code;
    }
    if (errorOption?.subject) {
      message = `${errorOption.subject}:: ${message}`;
    }
  }
  return { httpStatus, message, code };
}
