export const defaultRedisUserData = {
  "john.doe@gmail.com": {
    id: JSON.stringify("redis-id"),
    password: JSON.stringify("redis-password"),
    tasks: JSON.stringify("redis-tasks"),
    personalData: JSON.stringify("redis-personalData"),
  },
};

export const defaultRedisUser = {
  id: "redis-id",
  email: "john.doe@gmail.com",
  password: "redis-password",
  tasks: "redis-tasks",
  personalData: "redis-personalData",
};

export const fakeNewUser = {
  id: "new-id",
  email: "new.john@gmail.com",
  password: "new-password",
  tasks: "new-tasks",
  personalData: "new-personalData ",
};
