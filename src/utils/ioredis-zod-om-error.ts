import { ZodError } from 'zod';

export const enum ErrorType {
  UndefinedReturn = 'Undefined return',
  BadReturn = 'Bad return',
  BadParams = 'Bad parameters',
  UnknownError = 'Unknown error',
}

export class IoredisZodOmError extends Error {
  public errorType;

  public zodErrors;

  public unknownError;

  constructor({
    message,
    errorType,
    zodErrors,
    unknownError,
  }: {
    message: string;
    errorType: ErrorType;
    zodErrors?: ZodError['errors'];
    unknownError?: unknown;
  }) {
    super();
    this.message = message;
    this.errorType = errorType;
    this.zodErrors = zodErrors;
    this.unknownError = unknownError;
  }
}
