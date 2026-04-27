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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";

@ApiTags("users")
@Controller("user")
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: "Get personalized feed for the authenticated user" })
  @ApiOkResponse({ description: "Scored and sorted list of posts" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Get("/feed")
  async getFeed(@User() user: UserPayload){
    return await this.service.getFeed(user.sub);
  }


  @ApiBearerAuth()
  @ApiOperation({ summary: "Change display name of the authenticated user" })
  @ApiBody({ schema: { example: { newName: "Jane Doe" } } })
  @ApiOkResponse({ description: "Name updated" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/changeName")
  async changeName(
    @Body("newName") newName: string,
    @User() user: UserPayload,
  ) {
    await this.service.changeName(user.sub, newName);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Change profile picture of the authenticated user" })
  @ApiBody({ schema: { example: { mediaId: "uuid-of-image-media" } } })
  @ApiOkResponse({ description: "Profile picture updated" })
  @ApiNotFoundResponse({ description: "Media not found" })
  @ApiBadRequestResponse({ description: "Not an image, not owned, or already tied to a post" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/changePicture")
  async changePfp(@Body("mediaId") imageId: string, @User() user: UserPayload) {
    return this.service.changeProfilePicture(imageId, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Get liked posts of the authenticated user" })
  @ApiOkResponse({ description: "List of liked posts" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Get("/likes")
  async getUserLikes(@User() user: UserPayload) {
    return this.service.getLikes(user.sub);
  }

  @ApiOperation({ summary: "Get a user by UUID" })
  @ApiParam({ name: "id", description: "User UUID", type: String })
  @ApiOkResponse({ description: "User profile" })
  @ApiNotFoundResponse({ description: "User not found" })
  @Get("/:id")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getById(id);
  }

  @ApiOperation({ summary: "Get all posts by a user" })
  @ApiParam({ name: "id", description: "User UUID", type: String })
  @ApiOkResponse({ description: "List of posts" })
  @ApiNotFoundResponse({ description: "User not found" })
  @Get("/:id/posts")
  async getPosts(@Param("id", ParseUUIDPipe) id: string) {
    return await this.service.getPosts(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Follow a user" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Followed" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Blocked or trying to follow yourself" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/:id/follow")
  async followUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.followUser(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Unfollow a user" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Unfollowed" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Blocked or trying to unfollow yourself" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Delete("/:id/follow")
  async unFolllow(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.unfollowUser(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Block a user" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Blocked" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Already blocked or trying to block yourself" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/:id/block")
  async blockUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.blockUser(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Unblock a user" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Unblocked" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Not blocked or trying to unblock yourself" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Delete("/:id/block")
  async unblockUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.unblockUser(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Mute a user" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Muted" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Post("/:id/mute")
  async muteUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.muteUser(id, user.sub);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Unmute a user" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Unmuted" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Delete("/:id/mute")
  async unmuteUser(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: UserPayload,
  ) {
    return await this.service.unmuteUser(id, user.sub);
  }
  @ApiOperation({ summary: "Get users followers" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Followers" })
  @Get("/:id/followers")
  async getFollowers(@Param("id", ParseUUIDPipe) id: string){
    return await this.service.getFollowers(id)
  }
  @ApiOperation({ summary: "Get follows of user" })
  @ApiParam({ name: "id", description: "Target user UUID", type: String })
  @ApiOkResponse({ description: "Follows" })
  @Get("/:id/following")
  async getFollowing(@Param("id", ParseUUIDPipe) id: string){
    return await this.service.getFollowing(id)
  }
}
