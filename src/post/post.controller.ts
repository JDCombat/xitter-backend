import { EntityManager } from '@mikro-orm/postgresql';
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { XitterPost } from 'src/entities/Post';

@Controller('/post')
export class PostController {
  constructor(private em: EntityManager) {}
  @Get()
  async getAll() {
    const all = await this.em.findAll(XitterPost);
    return all;
  }
  @Get('/:id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const post = await this.em.findOne(XitterPost, id);
    return post;
  }
  @Post('/create')
  async create(@Body('content') content: string) {
    this.em.create(XitterPost, { content: content });
    await this.em.flush();
  }
}
