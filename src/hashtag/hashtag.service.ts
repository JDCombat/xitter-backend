import { Injectable } from '@nestjs/common';
import { HashtagRepository } from 'src/db/repositories/hashtagRepository';

@Injectable()
export class HashtagService {
  constructor(private readonly repo: HashtagRepository){}
  async getAll(){
    return await this.repo.findAll();
  }
  async getPosts(name: string){
    return (await this.repo.findOne({name}, {populate: ["posts"], fields: ["posts"]}))?.posts ?? []
  }
  async getTrending(){
    return await this.repo.findAll({limit: 5, orderBy: {popularity: "desc"}});
  }
}