import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { HashtagRepository } from "src/db/repositories/hashtagRepository";
import { MediaRepository } from "src/db/repositories/MediaRepository";
import { PostRepository } from "src/db/repositories/postRepository";
import { UserRepository } from "src/db/repositories/userRepository";

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly hashtagRepo: HashtagRepository,
    private readonly userRepo: UserRepository,
    private readonly mediaRepo: MediaRepository,
  ) {}
  async getAll() {
    return await this.postRepo.findAll();
  }
  async getById(id: string) {
    return await this.postRepo.findOne({ id });
  }
  async create(postData: { content: string; mediaId?: string }, user: string) {
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
    if (postData.mediaId) {
      const media = await this.mediaRepo.findOne({ id: postData.mediaId });
      if (!media) {
        throw new BadRequestException("Media with id does not exist");
      }
      post.media?.add(media);
    }
    await this.hashtagRepo.getEntityManager().flush();
    await this.postRepo.getEntityManager().flush();

    return post;
  }
  async editPost(
    postId: string,
    postData: { content: string; mediaId?: string },
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
      post.content = postData.content;
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
      post.media?.removeAll();
      if (postData.mediaId) {
        const media = await this.mediaRepo.findOne({ id: postData.mediaId });
        if (!media) {
          throw new BadRequestException("Media with id does not exist");
        }
        post.media?.add(media);
      }
    }
    await this.postRepo.getEntityManager().flush()
    await this.hashtagRepo.getEntityManager().flush();
    return post;
  }
  async deletePost(postId: string, userId: string) {
    const post = await this.postRepo.findOne({ id: postId });
    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }
    if (post.author.id != userId) {
      throw new ForbiddenException("You don't have permissions to this post");
    }

    await this.postRepo.nativeDelete({ id: postId });
  }
  async repost(postId: string, userId: string) {}
  async deleteRepost(postId: string, userId: string) {}
  async getPostLikes(postId: string) {
    const post = await this.postRepo.findOne({ id: postId }, {populate: ["likes"]});
    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }
    return post.likes;
  }
  async likePost(postId: string, userId: string) {
    const post = await this.postRepo.findOne({ id: postId });
    const user = (await this.userRepo.findOne({ id: userId }))!;

    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }

    post.likes?.add(user);
    user.likes?.add(post);
    await this.postRepo.getEntityManager().flush();
    await this.userRepo.getEntityManager().flush();
    return { liked: true };
  }
  async dislikePost(postId: string, userId: string) {
    const post = await this.postRepo.findOne({ id: postId });
    const user = (await this.userRepo.findOne({ id: userId }))!;

    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }

    post.likes?.remove(user);
    user.likes?.remove(post);
    await this.postRepo.getEntityManager().flush();
    await this.userRepo.getEntityManager().flush();
    return { liked: false };
  }
}
