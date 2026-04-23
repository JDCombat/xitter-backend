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
    return await this.postRepo.findAll({
      populate: ["author", "media", "repliesTo", "reposts"],
    });
  }
  async getById(id: string) {
    return await this.postRepo.findOne(
      { id },
      { populate: ["author", "media", "repliesTo", "reposts"] },
    );
  }
  async getReplies(id: string) {
    return await this.postRepo.find({ repliesTo: id });
  }
  async create(
    postData: { content: string; mediaIds?: string[] },
    userId: string,
  ) {
    console.log(postData);
    const post = this.postRepo.create({
      content: postData.content,
      author: userId,
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
    if (postData.mediaIds) {
      const media = await this.mediaRepo.find({
        id: { $in: postData.mediaIds },
      });
      if (media.length != postData.mediaIds.length) {
        throw new BadRequestException("Media with one of ids does not exist");
      }
      const user = await this.userRepo.findOne({ id: userId });
      console.log(media);
      media.forEach((e) => {
        if (e.owner != user!) {
          throw new BadRequestException("You don't own one of the media");
        }
        post.media?.add(e);
      });
    }
    await this.hashtagRepo.getEntityManager().flush();
    await this.postRepo.getEntityManager().flush();

    return post;
  }
  async editPost(
    postId: string,
    postData: { content: string; mediaIds?: string[] },
    userId: string,
  ) {
    const post = await this.postRepo.findOne(
      { id: postId },
      { populate: ["media", "hashtags"] },
    );
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
      if (postData.mediaIds) {
        const media = await this.mediaRepo.find({
          id: { $in: postData.mediaIds },
        });
        if (media.length != postData.mediaIds.length) {
          throw new BadRequestException("Media with one of ids does not exist");
        }
        const user = await this.userRepo.findOne({ id: userId });
        media.forEach((e) => {
          if (e.owner != user!) {
            throw new BadRequestException("You don't own one of the media");
          }
          post.media?.add(e);
        });
      }
      await this.postRepo.getEntityManager().flush();
      await this.hashtagRepo.getEntityManager().flush();
      return post;
    }
  }
  async reply(
    postId: string,
    postData: { content: string; mediaIds?: string[] },
    userId: string,
  ) {
    const user = (await this.userRepo.findOne(
      { id: userId },
      { populate: ["blockedUsers"] },
    ))!;
    const toReply = await this.postRepo.findOne(
      { id: postId },
      { populate: ["author", "author.blockedUsers"], fields: ["author"] },
    );
    if (!toReply) {
      throw new NotFoundException("Post with id does not exist");
    }
    if (toReply.author.blockedUsers?.contains(user)) {
      throw new BadRequestException("This user has blocked you");
    }
    if (user?.blockedUsers?.contains(toReply.author)) {
      throw new BadRequestException("You have blocked this user");
    }
    const post = this.postRepo.create({
      content: postData.content,
      author: userId,
      repliesTo: postId,
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
    if (postData.mediaIds) {
      const media = await this.mediaRepo.find({
        id: { $in: postData.mediaIds },
      });
      if (media.length != postData.mediaIds.length) {
        throw new BadRequestException("Media with one of ids does not exist");
      }
      const user = await this.userRepo.findOne({ id: userId });
      console.log(media);
      media.forEach((e) => {
        if (e.owner != user!) {
          throw new BadRequestException("You don't own one of the media");
        }
        post.media?.add(e);
      });
    }
    await this.hashtagRepo.getEntityManager().flush();
    await this.postRepo.getEntityManager().flush();

    return post;
  }
  async deletePost(postId: string, userId: string) {
    const post = await this.postRepo.findOne(
      { id: postId },
      { fields: ["author"] },
    );
    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }
    if (post.author.id != userId) {
      throw new ForbiddenException("You don't have permissions to this post");
    }

    await this.postRepo.nativeDelete(post);
  }
  async repost(postId: string, userId: string) {
    const user = (await this.userRepo.findOne(
      { id: userId },
      { populate: ["blockedUsers"] },
    ))!;
    const toRepost = await this.postRepo.findOne(
      { id: postId },
      { populate: ["author", "author.blockedUsers"], fields: ["author"] },
    );
    if (!toRepost) {
      throw new NotFoundException("Post with id does not exist");
    }
    if (toRepost.author.blockedUsers?.contains(user)) {
      throw new BadRequestException("This user has blocked you");
    }
    if (user?.blockedUsers?.contains(toRepost.author)) {
      throw new BadRequestException("You have blocked this user");
    }
    if ((await this.postRepo.count({ reposts: postId })) != 0) {
      throw new BadRequestException("You already reposted this");
    }
    const repost = this.postRepo.create({
      reposts: postId,
      author: userId,
    });
    await this.postRepo.getEntityManager().flush();
    return repost;
  }
  async deleteRepost(postId: string, userId: string) {
    const repost = await this.postRepo.findOne({
      reposts: postId,
      author: userId,
    });
    if (!repost) {
      throw new BadRequestException("You didn't repost this");
    }
    await this.postRepo.nativeDelete(repost);
  }
  async getPostLikes(postId: string) {
    const post = await this.postRepo.findOne(
      { id: postId },
      { populate: ["likes"] },
    );
    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }
    return post.likes;
  }
  async likePost(postId: string, userId: string) {
    const user = (await this.userRepo.findOne(
      { id: userId },
      { populate: ["blockedUsers"] },
    ))!;
    const post = await this.postRepo.findOne(
      { id: postId },
      { populate: ["author", "author.blockedUsers", "likes"], fields: ["author", "likes"] },
    );
    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }
    if (post.author.blockedUsers?.contains(user)) {
      throw new BadRequestException("This user has blocked you");
    }
    if (user?.blockedUsers?.contains(post.author)) {
      throw new BadRequestException("You have blocked this user");
    }

    post.likes?.add(user);
    await this.postRepo.getEntityManager().flush();
    return { liked: true };
  }
  async dislikePost(postId: string, userId: string) {
    const user = (await this.userRepo.findOne(
      { id: userId },
      { populate: ["blockedUsers"] },
    ))!;
    const post = await this.postRepo.findOne(
      { id: postId },
      { populate: ["author", "author.blockedUsers", "likes"], fields: ["author", "likes"] },
    );
    if (!post) {
      throw new NotFoundException("Post with id does not exist");
    }
    if (post.author.blockedUsers?.contains(user)) {
      throw new BadRequestException("This user has blocked you");
    }
    if (user?.blockedUsers?.contains(post.author)) {
      throw new BadRequestException("You have blocked this user");
    }

    post.likes?.remove(user);

    await this.postRepo.getEntityManager().flush();

    return { liked: false };
  }
}
