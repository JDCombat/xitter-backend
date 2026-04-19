import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "src/auth.guard";
import { PostService } from "./post.service";
import { User, type UserPayload } from "src/user/user.decorator";

@Controller("/post")
export class PostController {
  constructor(private readonly service: PostService) {}
  @Get()
  async getAll() {
    return await this.service.getAll();
  }
  @UseGuards(AuthGuard)
  @Post("/create")
  async create(
    @Body() postData: Record<string, string>,
    @User() user: UserPayload,
  ) {
    return await this.service.create(postData, user.sub);
  }
  @UseGuards(AuthGuard)
  @Post("/repost/:id")
  async repost() {}
  @Get("/:id")
  async getById(@Param("id", ParseIntPipe) id: number) {
    return await this.service.getById(id);
  }
  @Put("/:id")
  async editPost(@Param("id", ParseIntPipe) id: number) {}
  @Delete("/:id")
  async deletePost(@Param("id", ParseIntPipe) id: number) {}
}
