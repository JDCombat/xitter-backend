import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UserSchema } from "src/db/entities/User";
import { MediaSchema } from "src/db/entities/Media";

@Module({
  imports: [MikroOrmModule.forFeature([UserSchema, MediaSchema])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
