import { PrismaClient } from "@prisma/client";

type DbClient = PrismaClient;

const prismaClientSingleton = (): DbClient => {
  return new PrismaClient({ log: ["error"] });
};

declare global {
  var prismaGlobal: DbClient | undefined;
}

export const db: DbClient = (() => {
  const instance = globalThis.prismaGlobal ?? prismaClientSingleton();
  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = instance;
  }
  return instance;
})();
