import { Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PostSchema } from "src/db/entities/Post";
import { HashtagSchema } from "src/db/entities/Hashtags";
import { PostService } from "./post.service";
import { UserSchema } from "src/db/entities/User";
import { MediaSchema } from "src/db/entities/Media";

@Module({
  controllers: [PostController],
  imports: [MikroOrmModule.forFeature([PostSchema, HashtagSchema, UserSchema, MediaSchema])],
  providers: [PostService],
})
export class PostModule {}
