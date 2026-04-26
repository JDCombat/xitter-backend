import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MikroORM } from "@mikro-orm/postgresql";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { HashtagService } from "./hashtag/hashtag.service";
import { CronJob } from "cron";
import { RequestContext } from "@mikro-orm/core";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  const orm = app.get(MikroORM);
  await orm.schema.ensureDatabase();
  await orm.schema.update();
  await app.listen(process.env.PORT ?? 3000);
  const service = app.get(HashtagService);
  new CronJob(
    "0 * * * * *",
    async () => {
      await RequestContext.create(orm.em, async () => {
        await service.refresh();
      });
    },
    null,
    true,
    "Europe/Warsaw",
  );
}
bootstrap();
