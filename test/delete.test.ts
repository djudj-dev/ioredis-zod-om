import { describe, expect, it } from "vitest";
import {
  ErrorType,
  IoredisZodOmError,
} from "../src/utils/ioredis-zod-om-error";
import { string } from "../src/utils/string";
import { defaultRedisUser } from "./fake-data.spec";
import { user } from "./redis.spec";

describe("schema.delete test", () => {
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

    expect(await user.delete({ where: { email } })).toBe(true);

    let allPassLikeIthink = false;
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
});
