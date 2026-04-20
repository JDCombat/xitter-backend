import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import config from "../mikro-orm.config";
import { PostModule } from "./post/post.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { MediaModule } from "./media/media.module";

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    PostModule,
    AuthModule,
    UserModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
