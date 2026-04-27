import { Controller, Get, Param } from "@nestjs/common";
import { HashtagService } from "./hashtag.service";
import { ApiTags, ApiOperation, ApiOkResponse, ApiParam } from "@nestjs/swagger";

@ApiTags("hashtags")
@Controller("hashtag")
export class HashtagController {
  constructor(private readonly service: HashtagService) {}

  @ApiOperation({ summary: "Get all hashtags" })
  @ApiOkResponse({ description: "List of all hashtags" })
  @Get("/all")
  async getAll() {
    return await this.service.getAll();
  }

  @ApiOperation({ summary: "Get trending hashtags" })
  @ApiOkResponse({ description: "Trending hashtags ordered by popularity" })
  @Get("/trending")
  async getTrending() {
    return await this.service.getTrending();
  }

  @ApiOperation({ summary: "Get posts by hashtag name" })
  @ApiParam({ name: "name", description: "Hashtag name (without #)", type: String })
  @ApiOkResponse({ description: "Posts tagged with the given hashtag" })
  @Get("/name/:name")
  async getByName(@Param("name") name: string) {
    return await this.service.getPosts(name);
  }
}
