import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserSchema } from "src/db/entities/User";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MediaSchema } from "src/db/entities/Media";

@Module({
  imports: [
    MikroOrmModule.forFeature([UserSchema, MediaSchema]),
    JwtModule.register({
      global: true,
      secret: process.env.JWTSECRET,
      signOptions: { expiresIn: "10m" },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
