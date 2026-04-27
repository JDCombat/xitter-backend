import { EntityManager } from "@mikro-orm/postgresql";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { IPost, PostSchema } from "src/db/entities/Post";
import { UserSchema } from "src/db/entities/User";
import { MediaRepository } from "src/db/repositories/MediaRepository";
import { UserRepository } from "src/db/repositories/userRepository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mediaRepo: MediaRepository,
    private readonly em: EntityManager
  ) {}
  async getById(id: string) {
    return await this.userRepo.findOne(
      { id },
      { populate: ["followers", "following", "image"] },
    );
  }
  async getPosts(id: string) {
    const user = await this.userRepo.findOne(
      { id },
      {
        populate: [
          "posts",
          "posts.media",
          "posts.author",
          "posts.repliesTo",
          "posts.reposts",
        ],
        fields: ["posts"],
      },
    );
    if (!user) {
      throw new NotFoundException("User with id does not exist");
    }
    return user.posts;
  }
  async getLikes(userId: string) {
    const user = await this.userRepo.findOne(
      { id: userId },
      { populate: ["likes"], fields: ["likes"] },
    );
    return user?.likes;
  }
  async changeProfilePicture(userId: string, mediaId: string) {
    const user = (await this.userRepo.findOne({ id: userId }))!;
    const media = await this.mediaRepo.findOne(
      { id: mediaId },
      { populate: ["post"] },
    );
    if (!media) {
      throw new NotFoundException("Media with id doesn't exist");
    }
    if (!media.mimeType.includes("image")) {
      throw new BadRequestException("Pass an image media");
    }
    if (media.owner != user) {
      throw new BadRequestException("You don't own the media");
    }
    if (media.post) {
      throw new BadRequestException("Media is already tied to a post");
    }
    user.image = media;
    await this.userRepo.getEntityManager().flush();
  }
  async changeName(userId: string, newName: string) {
    const user = await this.userRepo.findOne({ id: userId });
    user!.name = newName;
    await this.userRepo.getEntityManager().flush();
    return user;
  }
  async followUser(targetId: string, userId: string) {
    if (targetId == userId) {
      throw new BadRequestException("You can't follow yourself dumbass");
    }
    const toFollow = await this.userRepo.findOne(
      { id: targetId },
      { populate: ["blockedUsers"], populateWhere: { id: userId } },
    );
    const user = await this.userRepo.findOne(
      { id: userId },
      {
        populate: ["following:ref", "blockedUsers"],
        populateWhere: { id: targetId },
      },
    );
    if (!toFollow) {
      throw new NotFoundException("User with id does not exist");
    }
    if (user?.blockedUsers?.contains(toFollow)) {
      throw new BadRequestException("You blocked this user");
    }
    if (toFollow?.blockedUsers?.contains(user!)) {
      throw new BadRequestException("This user blocked you");
    }
    user!.following?.add(toFollow);
    await this.userRepo.getEntityManager().flush();
  }
  async unfollowUser(targetId: string, userId: string) {
    if (targetId == userId) {
      throw new BadRequestException("You can't unfollow yourself dumbass");
    }
    const toUnfollow = await this.userRepo.findOne(
      { id: targetId },
      { populate: ["blockedUsers"], populateWhere: { id: userId } },
    );
    const user = await this.userRepo.findOne(
      { id: userId },
      {
        populate: ["following", "blockedUsers"],
        populateWhere: { id: targetId },
      },
    );
    if (!toUnfollow) {
      throw new NotFoundException("User with id does not exist");
    }
    if (user?.blockedUsers?.contains(toUnfollow)) {
      throw new BadRequestException("You blocked this user");
    }
    if (toUnfollow?.blockedUsers?.contains(user!)) {
      throw new BadRequestException("This user blocked you");
    }
    user!.following?.remove(toUnfollow);
    await this.userRepo.getEntityManager().flush();
  }

  async blockUser(blockId: string, userId: string) {
    if (blockId == userId) {
      throw new BadRequestException("You can't block yourself dumbass");
    }
    const user = await this.userRepo.findOne(
      { id: userId },
      {
        populate: ["blockedUsers:ref", "following"],
        populateWhere: { id: blockId },
        fields: ["blockedUsers", "following"],
      },
    );
    const userToBlock = this.userRepo.getReference(blockId);
    if (!userToBlock) {
      throw new NotFoundException("User with id does not exist");
    }
    if (user?.blockedUsers?.contains(userToBlock)) {
      throw new BadRequestException("You already blocked this user");
    }
    user!.blockedUsers?.add(userToBlock);
    user?.following?.remove(userToBlock);
    await this.userRepo.getEntityManager().flush();
  }
  async unblockUser(blockId: string, userId: string) {
    if (blockId == userId) {
      throw new BadRequestException("You can't unblock yourself dumbass");
    }
    const user = await this.userRepo.findOne(
      { id: userId },
      {
        populate: ["blockedUsers"],
        populateWhere: { id: blockId },
        fields: ["blockedUsers"],
      },
    );
    const userToUnblock = this.userRepo.getReference(blockId);
    if (!userToUnblock) {
      throw new NotFoundException("User with id does not exist");
    }
    if (!user?.blockedUsers?.contains(userToUnblock)) {
      throw new BadRequestException("You haven't blocked this user");
    }
    user.blockedUsers?.remove(userToUnblock);
    await this.userRepo.getEntityManager().flush();
  }
  async muteUser(muteId: string, userId: string) {
    const user = await this.userRepo.findOne(
      { id: userId },
      { populate: ["mutedUsers:ref"], fields: ["mutedUsers"] },
    );
    const userToMute = this.userRepo.getReference(muteId);
    if (!userToMute) {
      throw new NotFoundException("User with id does not exist");
    }
    user!.mutedUsers?.add(userToMute);
    await this.userRepo.getEntityManager().flush();
  }
  async unmuteUser(muteId: string, userId: string) {
    const user = await this.userRepo.findOne(
      { id: userId },
      {
        populate: ["mutedUsers"],
        populateWhere: { id: muteId },
        fields: ["mutedUsers"],
      },
    );
    const userToMute = this.userRepo.getReference(muteId);
    if (!userToMute) {
      throw new NotFoundException("User with id does not exist");
    }
    user!.mutedUsers?.remove(userToMute);
    await this.userRepo.getEntityManager().flush();
  }
  async getFollowers(userId: string){
    const followers = await this.userRepo.findOne({id: userId}, {populate: ["followers", "followers.image"], fields: ["followers"]})
    return followers?.followers;
  }
  async getFollowing(userId: string){
    const following = await this.userRepo.findOne({id: userId}, {populate: ["following", "following.image"], fields: ["following"]})
    return following?.following;
  }
  async getFeed(userId: string) {
    const user = (await this.em.findOne(
      UserSchema,
      { id: userId },
      {
        populate: [
          "mutedUsers",
          "blockedUsers",
          "likes",
          "following",
          "likes.author",
        ],
        fields: ["mutedUsers", "blockedUsers", "likes", "following"],
      },
    ))!;
    const posts = await this.em.find(
      PostSchema,
      {
        $and: [
          { author: { id: { $nin: user.mutedUsers?.getIdentifiers() } } },
          { author: { id: { $nin: user.blockedUsers?.getIdentifiers() } } },
          { author: { blockedUsers: { $none: userId } } },
          { author: { $ne: userId } },
        ],
      },
      {
        populate: ["media", "author", "author.blockedUsers", "hashtags", "reposts", "repliesTo"],
        populateWhere: { author: { blockedUsers: userId } },
        orderBy: { createdAt: "DESC" },
      },
    );
    const array: { score: number; post: IPost }[] = [];
    for (const post of posts) {
      const gravity = 2;
      const max_bonus = 50;
      const threshold = 10;
      let base_score = 1;

      base_score += post.likesCount;
      base_score += post.replyCount * 3;
      base_score += post.repostsCount * 5;

      const authorLikes =
        user.likes?.filter((e) => e.author.id == post.author.id).length ?? 0;
      const likesBonus =
        (max_bonus * Math.pow(authorLikes, 2)) /
        (threshold + Math.pow(authorLikes, 2));

      base_score += likesBonus;
      base_score += user.following?.contains(post.author) ? 100 : 0;

      const ageHours =
        (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
      const finalScore = base_score / Math.pow(ageHours + 2, gravity);

      array.push({ score: finalScore, post });
    }
    array.sort((e, j) => j.score - e.score);
    return array;
  }
}
