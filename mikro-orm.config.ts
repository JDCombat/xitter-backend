import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import "dotenv/config";
import { XitterPost } from "./src/entities/Post";

export default defineConfig({
  entities: [XitterPost],
  dbName: "xitterdb",
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.DB_HOST,
  driver: PostgreSqlDriver
});
