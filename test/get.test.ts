import { describe, expect, it } from "vitest";
import {
  ErrorType,
  IoredisZodOmError,
} from "../src/utils/ioredis-zod-om-error";
import { string } from "../src/utils/string";
import { defaultRedisUser } from "./fake-data.spec";
import { createCacheIndex, redisMock, user } from "./redis.spec";

describe("schema.get test", () => {
  it("sould return a part of user", async () => {
    const { password, tasks, email } = defaultRedisUser;
    const data = await user.get({
      where: { email },
      select: {
        password: true,
        tasks: true,
      },
    });

    expect(data).toEqual({ email, password, tasks });
  });

  it("sould return all the user", async () => {
    const { email } = defaultRedisUser;
    const data = await user.get({
      where: { email },
    });
    expect(data).toEqual(defaultRedisUser);
  });

  it("should throw an error 1", async () => {
    let allPassLikeIthink = false;

    try {
      await user.get({
        where: { email: "fake@email" },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.get_redis_data_undefined_error);
        expect(err.errorType).toBe(ErrorType.UndefinedReturn);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error 2", async () => {
    const { email } = defaultRedisUser;
    await redisMock.hset(createCacheIndex({ unique: { email } }), {
      id: JSON.stringify({
        test: "error",
      }),
    });
    let allPassLikeIthink = false;

    try {
      await user.get({
        where: { email },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.get_redis_return_bad_data);
        expect(err.errorType).toBe(ErrorType.BadReturn);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);

    // all data should have been deleted
    allPassLikeIthink = false;
    try {
      await user.get({
        where: { email },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.get_redis_data_undefined_error);
        expect(err.errorType).toBe(ErrorType.UndefinedReturn);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error 3", async () => {
    let allPassLikeIthink = false;

    try {
      await user.get({
        where: { email: 5 as unknown as string },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("get"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error 4", async () => {
    const { email } = defaultRedisUser;
    let allPassLikeIthink = false;

    try {
      await user.get({
        where: { email },
        select: {
          id: false as unknown as true,
        },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("get"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error 5", async () => {
    const { email } = defaultRedisUser;
    let allPassLikeIthink = false;

    try {
      await user.get({
        where: { email },
        select: {
          id: "bad" as unknown as true,
        },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("get"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error 6", async () => {
    let allPassLikeIthink = false;
    const { email } = defaultRedisUser;
    redisMock.hset(createCacheIndex({ unique: { email } }), "id", "test");

    try {
      await user.get({
        where: { email },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.unknown_error);
        expect(err.errorType).toBe(ErrorType.UnknownError);
        expect(err.unknownError).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });
});
