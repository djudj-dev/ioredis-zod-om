import { describe, expect, it } from "vitest";
import {
  ErrorType,
  IoredisZodOmError,
} from "../src/utils/ioredis-zod-om-error";
import { string } from "../src/utils/string";
import { fakeNewUser } from "./fake-data.spec";
import { user } from "./redis.spec";

describe("schema.safeCreate test", () => {
  it("sould return a part of user", async () => {
    const data = await user.safeCreate({
      data: fakeNewUser,
    });

    expect(data.success).toBe(true);
    expect(data.data).toEqual(fakeNewUser);
  });

  it("sould return a part of user", async () => {
    const { password, email } = fakeNewUser;
    const data = await user.safeCreate({
      data: fakeNewUser,
      select: {
        password: true,
      },
    });

    expect(data.success).toBe(true);
    expect(data.data).toEqual({ password, email });
  });

  it("should throw an error", async () => {
    let allPassLikeIthink = false;

    const data = await user.safeCreate({
      data: 5 as unknown as Parameters<typeof user.safeCreate>[0]["data"],
    });

    expect(data.success).toBe(false);
    const err = data.error;
    const isIoredisZodOmError = err instanceof IoredisZodOmError;

    expect(isIoredisZodOmError).toBe(true);

    if (isIoredisZodOmError) {
      expect(err.message).toBe(string.bad_parameters("create"));
      expect(err.errorType).toBe(ErrorType.BadParams);
      expect(err.zodErrors).toBeDefined();
      allPassLikeIthink = true;
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    let allPassLikeIthink = false;

    const data = await user.safeCreate({
      data: fakeNewUser,
      select: {
        id: false as unknown as true,
      },
    });
    expect(data.success).toBe(false);
    const err = data.error;

    const isIoredisZodOmError = err instanceof IoredisZodOmError;

    expect(isIoredisZodOmError).toBe(true);

    if (isIoredisZodOmError) {
      expect(err.message).toBe(string.bad_parameters("create"));
      expect(err.errorType).toBe(ErrorType.BadParams);
      expect(err.zodErrors).toBeDefined();
      allPassLikeIthink = true;
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    let allPassLikeIthink = false;

    const data = await user.safeCreate({
      data: fakeNewUser,
      select: {
        id: "bad" as unknown as true,
      },
    });
    expect(data.success).toBe(false);
    const err = data.error;

    const isIoredisZodOmError = err instanceof IoredisZodOmError;

    expect(isIoredisZodOmError).toBe(true);

    if (isIoredisZodOmError) {
      expect(err.message).toBe(string.bad_parameters("create"));
      expect(err.errorType).toBe(ErrorType.BadParams);
      expect(err.zodErrors).toBeDefined();
      allPassLikeIthink = true;
    }

    expect(allPassLikeIthink).toBe(true);
  });
});
