import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MikroORM } from "@mikro-orm/postgresql";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const orm = app.get(MikroORM);
  await orm.schema.ensureDatabase();
  await orm.schema.update();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
