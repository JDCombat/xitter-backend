import { Module } from "@nestjs/common";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MediaSchema } from "src/db/entities/Media";

@Module({
  imports: [MikroOrmModule.forFeature([MediaSchema])],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
