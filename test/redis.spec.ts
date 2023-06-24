import Redis from "ioredis-mock";
import { beforeEach } from "vitest";
import { z } from "zod";
import { defaultRedisUserData, fakeNewUser } from "./fake-data.spec";
import { createSchema } from "../src/utils/create-schema";

const redisMock = new Redis({
  data: defaultRedisUserData,
});

const { createCacheIndex, ...user } = createSchema(redisMock, {
  uniquePropsSchema: z.object({ email: z.string() }),

  propsSchema: z.object({
    id: z.string(),
    password: z.string(),
    personalData: z.string(),
    tasks: z.string(),
  }),

  defaultSelect: {
    id: true,
    password: true,
    personalData: true,
    tasks: true,
  },
});

beforeEach(async () => {
  redisMock.del(fakeNewUser.email);
  redisMock.hset(
    "john.doe@gmail.com",
    defaultRedisUserData["john.doe@gmail.com"]
  );
});

export { redisMock, createCacheIndex, user };
