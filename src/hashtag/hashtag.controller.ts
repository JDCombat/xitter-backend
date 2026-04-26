import { Controller, Get, Param } from "@nestjs/common";
import { HashtagService } from "./hashtag.service";
import { type Request } from "express";

@Controller("hashtag")
export class HashtagController {
  constructor(private readonly service: HashtagService) {}
  @Get("/all")
  async getAll() {
    return await this.service.getAll();
  }
  @Get("/trending")
  async getTrending() {
    return await this.service.getTrending();
  }
  @Get("/name/:name")
  async getByName(@Param("name") name: string) {
    return await this.service.getPosts(name);
  }
}
