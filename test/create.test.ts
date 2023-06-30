import { describe, expect, it } from "vitest";
import {
  ErrorType,
  IoredisZodOmError,
} from "../src/utils/ioredis-zod-om-error";
import { string } from "../src/utils/string";
import { fakeNewUser } from "./fake-data.spec";
import { createCacheIndex, redisMock, user } from "./redis.spec";

describe("schema.create test", () => {
  it("sould return a part of user", async () => {
    const data = await user.create({
      data: fakeNewUser,
    });

    expect(data).toEqual(fakeNewUser);
  });

  it("sould return a part of user", async () => {
    const { password, email } = fakeNewUser;
    const data = await user.create({
      data: fakeNewUser,
      select: {
        password: true,
      },
    });

    expect(data).toEqual({ password, email });
  });

  it("should throw an error", async () => {
    let allPassLikeIthink = false;

    try {
      await user.create({
        data: 5 as unknown as Parameters<typeof user.create>[0]["data"],
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("create"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    let allPassLikeIthink = false;

    try {
      await user.create({
        data: fakeNewUser,
        select: {
          id: false as unknown as true,
        },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("create"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should throw an error", async () => {
    let allPassLikeIthink = false;

    try {
      await user.create({
        data: fakeNewUser,
        select: {
          id: "bad" as unknown as true,
        },
      });
    } catch (err) {
      const isIoredisZodOmError = err instanceof IoredisZodOmError;

      expect(isIoredisZodOmError).toBe(true);

      if (isIoredisZodOmError) {
        expect(err.message).toBe(string.bad_parameters("create"));
        expect(err.errorType).toBe(ErrorType.BadParams);
        expect(err.zodErrors).toBeDefined();
        allPassLikeIthink = true;
      }
    }

    expect(allPassLikeIthink).toBe(true);
  });

  it("should make create with expiration", async () => {
    const data = await user.create({
      data: fakeNewUser,
      options: {
        expire: 4,
      },
    });

    expect(data).toEqual(fakeNewUser);
    const expiration = await redisMock.ttl(
      createCacheIndex({
        unique: { email: fakeNewUser.email },
      })
    );

    expect(expiration !== -1 && expiration <= 4).toBe(true);
  });

  it("should make create with expiration", async () => {
    const data = await user.create({
      data: fakeNewUser,
      options: {
        pexpire: 200,
      },
    });

    expect(data).toEqual(fakeNewUser);
    const expiration = await redisMock.ttl(
      createCacheIndex({
        unique: { email: fakeNewUser.email },
      })
    );

    expect(expiration !== -1 && expiration <= 2).toBe(true);
  });

  it("should make create with expiration", async () => {
    const data = await user.create({
      data: fakeNewUser,
      options: {
        persist: undefined,
      },
    });

    expect(data).toEqual(fakeNewUser);
    const expiration = await redisMock.ttl(
      createCacheIndex({
        unique: { email: fakeNewUser.email },
      })
    );

    expect(expiration).toBe(-1);
  });
});
