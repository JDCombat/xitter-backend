import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth.guard";
import { type UserPayload, User } from "./user.decorator";

@Controller("user")
export class UserController {
  constructor(private readonly service: UserService) {}
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

  @Get("/:id")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getById(id);
  }
  @Get("/:id/posts")
  async getPosts(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getPosts(id);
  }
  @UseGuards(AuthGuard)
  @Post("/:id/follow")
  async followUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    await this.service.followUser(id, user.sub);
  }
  @UseGuards(AuthGuard)
  @Delete("/:id/follow")
  async unFolllow(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    await this.service.unfollowUser(id, user.sub);
  }
  @UseGuards(AuthGuard)
  @Post("/:id/block")
  async blockUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    await this.service.blockUser(id, user.sub);
  }
  @UseGuards(AuthGuard)
  @Delete("/:id/block")
  async unblockUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    await this.service.unblockUser(id, user.sub);
  }
  @UseGuards(AuthGuard)
  @Post("/:id/mute")
  async muteUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    await this.service.muteUser(id, user.sub);
  }
  @UseGuards(AuthGuard)
  @Delete("/:id/mute")
  async unmuteUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    await this.service.unmuteUser(id, user.sub);
  }
}
