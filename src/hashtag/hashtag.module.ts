import { Module } from "@nestjs/common";
import { HashtagController } from "./hashtag.controller";
import { HashtagService } from "./hashtag.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { HashtagSchema } from "src/db/entities/Hashtags";

@Module({
  controllers: [HashtagController],
  providers: [HashtagService],
  imports: [MikroOrmModule.forFeature([HashtagSchema])],
})
export class HashtagModule {}
