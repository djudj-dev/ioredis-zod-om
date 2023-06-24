import { ZodError } from "zod";
import { ErrorType, IoredisZodOmError } from "./ioredis-zod-om-error";
import { string } from "./string";

export const fnErrorCatcher =
  <T extends (option: any) => any>(fn: T) =>
  async (option: Parameters<T>[0]) => {
    try {
      return (await fn(option)) as ReturnType<T>;
    } catch (error) {
      const isZodError = error instanceof ZodError;
      const isIoredisZodOmError = error instanceof IoredisZodOmError;

      if (isZodError) {
        throw new IoredisZodOmError({
          message: string.bad_parameters(fn.name),
          errorType: ErrorType.BadParams,
          zodErrors: error.errors,
        });
      }

      if (isIoredisZodOmError) {
        throw error;
      }

      throw new IoredisZodOmError({
        message: string.unknown_error,
        errorType: ErrorType.UnknownError,
        unknownError: error,
      });
    }
  };

export const fnSafeErrorCatcher =
  <T extends (option: any) => any>(fn: T) =>
  async (option: Parameters<T>[0]) => {
    try {
      const data = (await fn(option)) as ReturnType<T>;
      return { success: true, data };
    } catch (error) {
      const isZodError = error instanceof ZodError;
      const isIoredisZodOmError = error instanceof IoredisZodOmError;

      if (isZodError) {
        return {
          success: false,
          error: new IoredisZodOmError({
            message: string.bad_parameters(fn.name),
            errorType: ErrorType.BadParams,
            zodErrors: error.errors,
          }),
        };
      }

      if (isIoredisZodOmError) {
        return {
          success: false,
          error,
        };
      }

      return {
        success: false,
        error: new IoredisZodOmError({
          message: string.unknown_error,
          errorType: ErrorType.UnknownError,
          unknownError: error,
        }),
      };
    }
  };
