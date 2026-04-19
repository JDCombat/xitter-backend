import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import "dotenv/config";
import { BaseEntitySchema } from "src/db/entities/BaseEntity";
import { HashtagSchema } from "src/db/entities/Hashtags";
import { PostSchema } from "src/db/entities/Post";
import { UserSchema } from "src/db/entities/User";

export default defineConfig({
  entities: [BaseEntitySchema, PostSchema, UserSchema, HashtagSchema],
  dbName: "xitterdb",
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.DB_HOST,
  driver: PostgreSqlDriver
});
