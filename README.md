# ioredis-zod-om

A small library that uses zod and ioredis to create typesafe schemas for an easyest redis object use

## Authors

- [@Djudj_dev](https://github.com/Juju23dev)

## Install

npm:

```bash
  npm install @e2fy/ioredis-zod-om
```

yarn:

```bash
  yarn install @e2fy/ioredis-zod-om
```

pnpm:

```bash
  pnpm install @e2fy/ioredis-zod-om
```

## Getting started

First you need to create a schema

### `createSchema` has 2 parameters :

- `redisClient` : an instace of Redis from ioredis lib
- `option` : an object with 3 properties :

```typescript
{
  uniquePropsSchema, // a zod object schema with all your unique prop(s) ( like email for users )
    propsSchema; // a zod object schema for all your non unique props ( like name for user )
  defaultSelect; // an { [keyof propsSchema]: true } object for the default select use for data return
}
```

let's do this

```typescript
import { z } from 'zod'
import { createSchema } from '@e2fy/ioredis-zod-om'
import { myIoredisClient } from './ioredis-client'

const userSchema = createSchema(myIoredisClient, {
    uniquePropsSchema: z.object({ email: z.string() }),
    propsSchema: z.object({
        id: z.number(),
        password: z.string(),
        firstName: z.string(),
        lastName: z.string(),
    }),
    defaultSelect: {
        id: true,
        password, true,
    }
})

```

**⚠️ Non unique props can't be optional, use nullable instead because just one undefined props will cause a key delete on get method call, it's for be sure you have consistency data**

now `userSchema` can be used for interact with redis

## schema methods

## `get`

get take an object parameter with 2 props:

- `where` need to be an object with unique prop(s)
- `select` is an optional `{ [keyof propsSchema]: true }` object each props wrote will be return

**⚠️ if select not defined it's defaultSelect use in create schema used**\
**⚠️ unique prop(s) are always return**

the return is an object with unique(s) and select properties

```typescript
const myUser = await userSchema.get({ where: { email: "test@email.com" } });
/* 
{ 
    email: 'test@email.com',
    id: 15,
    password: 'strong password',
}
*/

const myUser = await userSchema.get({
  where: { email: "test@email.com" },
  select: {
    firstName: true,
    lastName: true,
  },
});
/* 
{ 
    email: 'test@email.com',
    firstName: 'john',
    lastName: 'doe'
}
*/
```

**⚠️ If a prop is undefined or if data parsing with zod don't success the key is deleted and you need to recreate**

## `delete`

delete take an object parameter with 1 prop:

- `where` need to be an object with unique prop(s)

the return is `true` if he deleted and `false` if nothing existed with this `where`

```typescript
await userSchema.delete({ where: { email: "existing@user.com" } });
// true

await userSchema.delete({ where: { email: "existing@user.com" } });
// false ( you already delete it)
```

## `create`

create take an object parameter with 2 props:

- `data` need to be an object with all unique prop(s) and non unique props
- `options` is an optional object with optional props `expire`, `pexpire`, `persist` and associated value for the cache key
  **⚠️ persist don't use value but the properties need to have undefined value**\
  for more information on `expire`, `pexpire`, `persist` check [ioredis doc](https://github.com/redis/ioredis/blob/f68290e9054aa1a2abc2c5bb45f2c6239a1fe4b5/examples/ttl.js)
- `select` is an optional `{ [keyof propsSchema]: true }` object each props wrote will be return

**⚠️ if select not defined it's defaultSelect use in create schema used**

the return is an object with unique(s) and select properties

```typescript
await userSchema.create({
  data: {
    email: "rick@morty.com",
    id: 15,
    password: "password",
    firstName: "Rick",
    lastName: "Sanchez",
  },
});
/* 
{ 
    email: 'rick@morty.com',
    id: 15,
    password: 'password',
}
*/

await userSchema.create({
  data: {
    email: "morty@rick.com",
    id: 16,
    password: "password",
    firstName: "Morty",
    lastName: "Smith",
  },
  select: {
    firstName: true,
    lastName: true,
  },
});
/* 
{ 
    email: 'morty@rick.com',
    firstName: 'Rick',
    lastName: 'Sanchez',
}
*/
```

## `update`

update take an object parameter with 3 props:

- `where` need to be an object with unique prop(s)
- `data` need to be an object with all non unique props you whant to update
- `select` is an optional `{ [keyof propsSchema]: true }` object each props wrote will be return

**⚠️ if select not defined it's defaultSelect use in create schema used**

the return is an object with unique(s) and select properties

```typescript
const newNameRick = await userSchema.update({
  where: { email: "rick@morty.com" },
  data: { firstName: "Jerry" },
  select: { firstName: true },
});
// { email: 'rick@morty.com', firstName: 'Jerry' }
```

if you change the unique of a schema you juste need to delete th older and create another ( or not if you set expiration )

## Errors

All schema method can throw an `IoredisZodOmError` \
`IoredisZodOmError` have `message`, `errorType` props and can have `zodErrors` or `unknownError` also

Their is multiples `errorType`:

- `'Undefined return'` throw when a get have undefined value ( the key will be deleted after this error )
- `'Bad return'` throw when a get have bad value return ( the key will be deleted after this error )
- `'Bad parameters'` throw when parameters are bad in schema methods
- `'Unknown error'` throw when a an unknown error append in schema method

## One more thing

all schema method have safe equivalent:
safe will return: \
`{ success: boolean, data: /*if success*/, error: /*if error*/ }` \
all non safe method can trow an error

**safe methods and equivalent**:

- `get` => `safeGet`
- `delete` => `safeDelete`
- `create` => `safeCreate`
- `update` => `safeUpdate`

they all take same paramaters than the non safe equivalent
