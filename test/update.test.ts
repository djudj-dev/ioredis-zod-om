import { describe, expect, it } from "vitest";
import {
  ErrorType,
  IoredisZodOmError,
} from "../src/utils/ioredis-zod-om-error";
import { string } from "../src/utils/string";
import { defaultRedisUser } from "./fake-data.spec";
import { user } from "./redis.spec";

describe("schema.create test", () => {
  it("sould return a part of user", async () => {
    const { email } = defaultRedisUser;
    const password = "super new password";
    const data = await user.update({
      where: { email },
      data: { password },
    });

    expect(data).toEqual({ ...defaultRedisUser, password });
  });

  it("sould return a part of user", async () => {
    const { email } = defaultRedisUser;
    const password = "super new password";
    const data = await user.update({
      where: { email },
      data: { password },
      select: {
        password: true,
      },
    });

    expect(data).toEqual({ email, password });
  });

  it("should throw an error", async () => {
    const { email } = defaultRedisUser;
    let allPassLikeIthink = false;

    try {
      await user.update({
        where: { email },
        data: 5 as unknown as Parameters<typeof user.update>[0]["data"],
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("update"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    const { email, password } = defaultRedisUser;
    let allPassLikeIthink = false;

    try {
      await user.update({
        where: { email },
        data: { password },
        select: {
          id: false as unknown as true,
        },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("update"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    const { email, password } = defaultRedisUser;
    let allPassLikeIthink = false;

    try {
      await user.update({
        where: { email },
        data: { password },
        select: {
          id: "bad" as unknown as true,
        },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("update"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });
});
