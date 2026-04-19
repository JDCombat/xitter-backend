import { wrap } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { HashtagRepository } from "src/db/repositories/hashtagRepository";
import { PostRepository } from "src/db/repositories/postRepository";

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly hashtagRepo: HashtagRepository,
  ) {}
  async getAll() {
    return await this.postRepo.findAll();
  }
  async getById(id: number) {
    return await this.postRepo.find({
      id: id,
    });
  }
  async create(postData: Record<string, string>, user: number) {
    const post = this.postRepo.create({
      content: postData.content,
      author: user,
    });
    const names = postData.content.match(/#(\w+)/g)?.map((e) => e.slice(1));
    if (names?.length ?? 0 > 0) {
      const existingTags = await this.hashtagRepo.find({
        name: { $in: names },
      });
      const existingTagsMap = new Map(existingTags.map((t) => [t.name, t]));
      names?.forEach((e) => {
        let tag = existingTagsMap.get(e);
        if (!tag) {
          tag = this.hashtagRepo.create({ name: e });
        }
        post.hashtags?.add(tag);
      });
    }
    await this.hashtagRepo.getEntityManager().flush();
    await this.postRepo.getEntityManager().flush();

    return wrap(post).toJSON();
  }
}
