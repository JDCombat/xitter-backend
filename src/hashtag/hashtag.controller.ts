import { Controller, Get, Param } from '@nestjs/common';
import { HashtagService } from './hashtag.service';

@Controller('hashtag')
export class HashtagController {
  constructor(private readonly service: HashtagService){}
  @Get("/all")
  async getAll(){
    return await this.service.getAll();
  }
  @Get("/:name")
  async getByName(@Param("name") name: string){
    return await this.service.getPosts(name);
  }
  @Get("/trending")
  async getTrending(){
    return await this.service.getTrending();
  }
}
