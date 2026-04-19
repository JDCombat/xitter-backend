import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UserSchema } from "src/db/entities/User";

@Module({
  imports: [MikroOrmModule.forFeature([UserSchema])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
