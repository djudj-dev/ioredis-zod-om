import { z } from 'zod';
// eslint-disable-next-line
import { Redis } from 'ioredis';
import { fnErrorCatcher, fnSafeErrorCatcher } from './wrap-fn-error';
import { ErrorType, IoredisZodOmError } from './ioredis-zod-om-error';
import { string } from './string';

const createSchema = <T extends z.ZodObject<any>, K extends z.ZodObject<any>>(
  redisClient: Redis,
  {
    uniquePropsSchema,
    propsSchema,
    defaultSelect,
  }: {
    uniquePropsSchema: K;
    propsSchema: T;
    defaultSelect: Partial<Record<keyof z.infer<typeof propsSchema>, true>>;
  }
) => {
  const partialProps = propsSchema.partial();
  const createUnion = uniquePropsSchema.and(propsSchema);
  const finalUnion = uniquePropsSchema.and(partialProps);
  const selectSchema = z.record(
    propsSchema.keyof(),
    z.boolean().refine((val) => val === true)
  );

  type UniqueProps = z.infer<typeof uniquePropsSchema>;
  type Props = z.infer<typeof propsSchema>;
  type PropsEntries<U> = [keyof U, U[keyof U]];
  type PartialProps = Partial<z.infer<typeof propsSchema>>;
  type SelectOptions = Partial<Record<keyof z.infer<typeof propsSchema>, true>>;

  type Options = {
    persist?: undefined;
    pexpire?: Parameters<Redis['pexpire']>[1];
    expire?: Parameters<Redis['expire']>[1];
  };

  const createCacheIndex = ({ unique }: { unique: UniqueProps }) => Object.values(unique).join('');

  const deleteOne = async ({ where }: { where: UniqueProps }) => {
    const unique = uniquePropsSchema.parse(where);

    return !!(await redisClient.del(
      createCacheIndex({
        unique,
      })
    ));
  };

  const get = async ({ where, select }: { where: UniqueProps; select?: SelectOptions }) => {
    const unique = uniquePropsSchema.parse(where);
    const selectObject = select ? selectSchema.parse(select) : defaultSelect;
    const selectKeys = Object.keys(selectObject) as (keyof Props)[];

    const redisReturn = z
      .string()
      .transform((arg) => JSON.parse(arg))
      .array()
      .safeParse(
        await redisClient.hmget(
          createCacheIndex({
            unique,
          }),
          ...(selectKeys as string[])
        )
      );

    if (!redisReturn.success) {
      await deleteOne({ where: unique });
      throw new IoredisZodOmError({
        message: string.get_redis_data_undefined_error,
        errorType: ErrorType.UndefinedReturn,
        zodErrors: redisReturn.error.errors,
      });
    }

    const returnObject: z.infer<typeof finalUnion> = unique;

    selectKeys.forEach((index, arrayIndex) => {
      returnObject[index] = redisReturn.data[arrayIndex] as (typeof returnObject)[typeof index];
    });

    const finalData = finalUnion.safeParse(returnObject);

    if (!finalData.success) {
      await deleteOne({ where: unique });
      throw new IoredisZodOmError({
        message: string.get_redis_return_bad_data,
        errorType: ErrorType.BadReturn,
        zodErrors: finalData.error.errors,
      });
    }

    return finalData.data as UniqueProps &
      Pick<
        Props,
        typeof select extends undefined ? keyof typeof select : keyof typeof defaultSelect
      >;
  };

  const create = async ({
    data,
    select,
    options = {},
  }: {
    data: z.infer<typeof createUnion>;
    select?: SelectOptions;
    options?: Options;
  }) => {
    const userProps = propsSchema
      .transform((obj) => {
        const finalObject: typeof obj = {};
        Object.entries(obj).forEach(([index, value]) => {
          finalObject[index] = JSON.stringify(value);
        });

        return finalObject;
      })
      .parse(data);
    const unique = uniquePropsSchema.parse(data);
    const pipeline = redisClient.pipeline();
    const cacheIndex = createCacheIndex({
      unique,
    });

    pipeline.hset(cacheIndex, userProps);

    Object.entries(options).forEach((entrie) => {
      const [optionIndex, optionParam] = entrie as PropsEntries<Options>;

      if (typeof pipeline[optionIndex] !== 'function') {
        // should never append just security
        return;
      }

      const fn = pipeline[optionIndex] as CallableFunction;
      if (optionParam !== undefined) {
        fn(cacheIndex, optionParam);
      } else {
        fn(cacheIndex);
      }
    });

    await pipeline.exec();

    return get({ where: { ...unique }, select });
  };

  const update = async ({
    where,
    data,
    select,
  }: {
    where: UniqueProps;
    data: PartialProps;
    select?: SelectOptions;
  }) => {
    const userProps = partialProps.parse(data);
    const unique = uniquePropsSchema.parse(where);
    const pipeline = redisClient.pipeline();

    Object.entries(userProps).forEach((entrie) => {
      const [index, value] = entrie as PropsEntries<typeof userProps>;
      const cacheIndex = createCacheIndex({
        unique,
      });
      pipeline.hset(cacheIndex, index as string, JSON.stringify(value));
    });

    await pipeline.exec();

    return get({ where: { ...unique }, select });
  };

  return {
    createCacheIndex,
    get: fnErrorCatcher(get),
    create: fnErrorCatcher(create),
    update: fnErrorCatcher(update),
    delete: fnErrorCatcher(deleteOne),
    safeGet: fnSafeErrorCatcher(get),
    safeCreate: fnSafeErrorCatcher(create),
    safeUpdate: fnSafeErrorCatcher(update),
    safeDelete: fnSafeErrorCatcher(deleteOne),
  };
};

export { createSchema };
