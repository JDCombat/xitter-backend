import { wrap } from "@mikro-orm/core";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
  async getById(id: string) {
    return await this.postRepo.find({
      id: id,
    });
  }
  async create(postData: Record<string, string>, user: string) {
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

    return post;
  }
  async editPost(
    postId: string,
    postData: { content: string; mediaId: string },
    userId: string,
  ) {
    const post = await this.postRepo.findOne({ id: postId });
    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }
    if (post.author.id != userId) {
      throw new ForbiddenException("You don't have permissions to this post");
    }
    if (post.content != postData.content) {
      post.hashtags?.removeAll();
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
    }

  }
  async deletePost(postId: string, userId: string){
    const post = await this.postRepo.findOne({id: postId})
    if(!post){
      throw new NotFoundException("Post with id does not exist");
    }
    if (post.author.id != userId) {
      throw new ForbiddenException("You don't have permissions to this post");
    }

    await this.postRepo.nativeDelete({id: postId})
  }
  async repost(postId: string, user: string){
    
  }

}


