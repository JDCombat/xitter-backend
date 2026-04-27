import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import config from "../mikro-orm.config";
import { PostModule } from "./post/post.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { MediaModule } from "./media/media.module";
import { HashtagModule } from "./hashtag/hashtag.module";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_SERVER,
        port: 465,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
    }),
    PostModule,
    AuthModule,
    UserModule,
    MediaModule,
    HashtagModule,
  ],
})
export class AppModule {}
