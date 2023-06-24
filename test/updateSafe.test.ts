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
    const data = await user.safeUpdate({
      where: { email },
      data: { password },
    });

    expect(data.success).toEqual(true);
    expect(data.data).toEqual({ ...defaultRedisUser, password });
  });

  it("sould return a part of user", async () => {
    const { email } = defaultRedisUser;
    const password = "super new password";
    const data = await user.safeUpdate({
      where: { email },
      data: { password },
      select: {
        password: true,
      },
    });

    expect(data.success).toEqual(true);
    expect(data.data).toEqual({ email, password });
  });

  it("should throw an error", async () => {
    const { email } = defaultRedisUser;
    let allPassLikeIthink = false;

    const data = await user.safeUpdate({
      where: { email },
      data: 5 as unknown as Parameters<typeof user.safeUpdate>[0]["data"],
    });
    expect(data.success).toEqual(false);
    const err = data.error;

    const isIoredisZodOmError = err instanceof IoredisZodOmError;

    expect(isIoredisZodOmError).toBe(true);

    if (isIoredisZodOmError) {
      expect(err.message).toBe(string.bad_parameters("update"));
      expect(err.errorType).toBe(ErrorType.BadParams);
      expect(err.zodErrors).toBeDefined();
      allPassLikeIthink = true;
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    const { email, password } = defaultRedisUser;
    let allPassLikeIthink = false;

    const data = await user.safeUpdate({
      where: { email },
      data: { password },
      select: {
        id: false as unknown as true,
      },
    });
    expect(data.success).toEqual(false);
    const err = data.error;
    const isIoredisZodOmError = err instanceof IoredisZodOmError;

    expect(isIoredisZodOmError).toBe(true);

    if (isIoredisZodOmError) {
      expect(err.message).toBe(string.bad_parameters("update"));
      expect(err.errorType).toBe(ErrorType.BadParams);
      expect(err.zodErrors).toBeDefined();
      allPassLikeIthink = true;
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    const { email, password } = defaultRedisUser;
    let allPassLikeIthink = false;

    const data = await user.safeUpdate({
      where: { email },
      data: { password },
      select: {
        id: "bad" as unknown as true,
      },
    });
    expect(data.success).toEqual(false);
    const err = data.error;
    const isIoredisZodOmError = err instanceof IoredisZodOmError;

    expect(isIoredisZodOmError).toBe(true);

    if (isIoredisZodOmError) {
      expect(err.message).toBe(string.bad_parameters("update"));
      expect(err.errorType).toBe(ErrorType.BadParams);
      expect(err.zodErrors).toBeDefined();
      allPassLikeIthink = true;
    }

    expect(allPassLikeIthink).toBe(true);
  });
});
