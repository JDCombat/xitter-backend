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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("posts")
@Controller("/post")
export class PostController {
  constructor(private readonly service: PostService) {}

  @ApiOperation({ summary: "Get all posts" })
  @ApiOkResponse({ description: "List of all posts" })
  @Get()
  async getAll() {
    return await this.service.getAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new post" })
  @ApiBody({ type: PostDataDTO })
  @ApiCreatedResponse({ description: "Post created successfully" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @ApiBadRequestResponse({ description: "Invalid media IDs or media not owned by user" })
  @UseGuards(AuthGuard)
  @Post("/create")
  async create(@Body() postData: PostDataDTO, @User() user: UserPayload) {
    return await this.service.create(postData, user.sub);
  }

  @ApiOperation({ summary: "Get a single post by UUID" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiOkResponse({ description: "Post found" })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Get("/:id")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Edit an existing post" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiBody({ type: PostDataDTO })
  @ApiOkResponse({ description: "Post updated" })
  @ApiNotFoundResponse({ description: "Post not found" })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Put("/:id")
  async editPost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
    @Body() postData: PostDataDTO,
  ) {
    return await this.service.editPost(id, postData, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a post" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiOkResponse({ description: "Post deleted successfully" })
  @ApiNotFoundResponse({ description: "Post not found" })
  @ApiForbiddenResponse({ description: "Not the author" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Delete("/:id")
  async deletePost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.deletePost(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Reply to a post" })
  @ApiParam({ name: "id", description: "Parent post UUID", type: String })
  @ApiBody({ type: PostDataDTO })
  @ApiCreatedResponse({ description: "Reply created" })
  @ApiNotFoundResponse({ description: "Parent post not found" })
  @ApiBadRequestResponse({ description: "Author has blocked you or vice versa" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/:id/reply")
  async reply(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() postData: PostDataDTO,
    @User() user: UserPayload,
  ) {
    return await this.service.reply(id, postData, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Repost a post" })
  @ApiParam({ name: "id", description: "Post UUID to repost", type: String })
  @ApiCreatedResponse({ description: "Repost created" })
  @ApiNotFoundResponse({ description: "Post not found" })
  @ApiBadRequestResponse({ description: "Already reposted or blocked" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/:id/repost")
  async repost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.repost(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Undo a repost" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiOkResponse({ description: "Repost removed" })
  @ApiBadRequestResponse({ description: "You haven't reposted this" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Delete("/:id/repost")
  async deleteRepost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.deleteRepost(id, user.sub);
  }

  @ApiOperation({ summary: "Get all users who liked a post" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiOkResponse({ description: "List of users" })
  @ApiNotFoundResponse({ description: "Post not found" })
  @Get("/:id/likes")
  async getLikes(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getPostLikes(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Like a post" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiNotFoundResponse({ description: "Post not found" })
  @ApiBadRequestResponse({ description: "Already liked, blocked, or own post" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/:id/likes")
  async likePost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.likePost(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Unlike a post" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiNotFoundResponse({ description: "Post not found" })
  @ApiBadRequestResponse({ description: "Haven't liked this post or blocked" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Delete("/:id/likes")
  async dislikePost(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.dislikePost(id, user.sub);
  }

  @ApiOperation({ summary: "Get all replies to a post" })
  @ApiParam({ name: "id", description: "Post UUID", type: String })
  @ApiOkResponse({ description: "List of reply posts" })
  @Get("/:id/replies")
  async getReplies(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getReplies(id);
  }
}
