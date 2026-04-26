import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "src/auth.guard";
import { PostService } from "./post.service";
import { User, type UserPayload } from "src/user/user.decorator";
import { PostDataDTO } from "./dtos";

@Controller("/post")
export class PostController {
  constructor(private readonly service: PostService) {}
  @Get()
  async getAll() {
    return await this.service.getAll();
  }
  @UseGuards(AuthGuard)
  @Post("/create")
  async create(@Body() postData: PostDataDTO, @User() user: UserPayload) {
    return await this.service.create(postData, user.sub);
  }
  @Get("/:id")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getById(id);
  }
  @UseGuards(AuthGuard)
  @Put("/:id")
  async editPost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
    @Body() postData: PostDataDTO,
  ) {
    return await this.service.editPost(id, postData, user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id")
  async deletePost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.deletePost(id, user.sub);
  }

  @UseGuards(AuthGuard)
  @Post("/:id/reply")
  async reply(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() postData: PostDataDTO,
    @User() user: UserPayload,
  ) {
    return await this.service.reply(id, postData, user.sub);
  }

  @UseGuards(AuthGuard)
  @Post("/:id/repost")
  async repost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.repost(id, user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id/repost")
  async deleteRepost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.deleteRepost(id, user.sub);
  }

  @Get("/:id/likes")
  async getLikes(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getPostLikes(id);
  }
  @UseGuards(AuthGuard)
  @Post("/:id/likes")
  async likePost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.likePost(id, user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete("/:id/likes")
  async dislikePost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.dislikePost(id, user.sub);
  }

  @Get("/:id/replies")
  async getReplies(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getReplies(id);
  }
}
