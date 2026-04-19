import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth.guard";
import { type UserPayload, User } from "./user.decorator";

@Controller("user")
export class UserController {
  constructor(private readonly service: UserService) {}
  @Get("/:id")
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.service.getById(id);
  }
  @Get("/:id/posts")
  async getPosts(@Param("id", ParseIntPipe) id: number) {
    return await this.service.getPosts(id);
  }
  @UseGuards(AuthGuard)
  @Post("/follow/:id")
  async followUser(
    @Param("id", ParseIntPipe) id: number,
    @User() user: UserPayload,
  ) {
    await this.service.followUser(id, user.sub);
  }
  @UseGuards(AuthGuard)
  @Delete("/follow/:id")
  async unFolllow(
    @Param("id", ParseIntPipe) id: number,
    @User() user: UserPayload,
  ) {
    await this.service.unfollowUser(id, user.sub);
  }
  @UseGuards(AuthGuard)
  @Post("/changeName")
  async changeName(
    @Body("newName") newName: string,
    @User() user: UserPayload,
  ) {
    await this.service.changeName(user.sub, newName);
  }

  @UseGuards(AuthGuard)
  @Post("/changePicture")
  async changePfp(
    @Body("image") image: Express.Multer.File,
    @User() user: UserPayload,
  ) {}
}
