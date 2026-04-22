import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MediaRepository } from "src/db/repositories/MediaRepository";
import { UserRepository } from "src/db/repositories/userRepository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mediaRepo: MediaRepository,
  ) {}
  async getById(id: string) {
    return await this.userRepo.findOne({ id }, {populate: ["followers", "following", "image"]});
  }
  async getPosts(id: string) {
    const user = await this.userRepo.findOne({ id }, { populate: ["posts"] });
    if (!user) {
      throw new NotFoundException("User with id does not exist");
    }
    return user.posts;
  }
  async getLikes(userId: string){
    const user = await this.userRepo.findOne({ id: userId }, { populate: ["likes"] });
    return user?.likes;
  }
  async followUser(target: string, user: string) {
    const toFollow = await this.userRepo.findOne(
      { id: target },
      { populate: ["followers"] },
    );
    const following = await this.userRepo.findOne(
      { id: user },
      { populate: ["following"] },
    );
    if (!toFollow) {
      throw new NotFoundException("User with id does not exist");
    }
    toFollow.followers?.add(following!);
    following!.following?.add(toFollow);
    await this.userRepo.getEntityManager().flush();
  }
  async unfollowUser(targetId: string, userId: string) {
    const toUnfollow = await this.userRepo.findOne(
      { id: targetId },
      { populate: ["followers"] },
    );
    const following = await this.userRepo.findOne(
      { id: userId },
      { populate: ["following"] },
    );
    if (!toUnfollow) {
      throw new NotFoundException("User with id does not exist");
    }
    toUnfollow.followers?.remove(following!);
    following!.following?.remove(toUnfollow);
    await this.userRepo.getEntityManager().flush();
  }
  async changeProfilePicture(userId: string, mediaId: string) {
    const user = (await this.userRepo.findOne({ id: userId }))!;
    const media = await this.mediaRepo.findOne({ id: mediaId });
    if (!media) {
      throw new NotFoundException("Media with id doesn't exist");
    }
    if (!media.mimeType.includes("image")) {
      throw new BadRequestException("Pass an image media");
    }
    if(media.owner != user){
      throw new BadRequestException("You don't own the media");
    }
    if(media.post){
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
  async blockUser(blockId: string, userId: string) {
    const user = await this.userRepo.findOne({ id: userId });
    const userToBlock = await this.userRepo.findOne({ id: blockId });
    if (!userToBlock) {
      throw new NotFoundException("User with id does not exist");
    }
    user!.blockedUsers?.add(userToBlock);
    await this.userRepo.getEntityManager().flush();
    return { blocked: true };
  }
  async unblockUser(blockId: string, userId: string) {
    const user = await this.userRepo.findOne({ id: userId });
    const userToBlock = await this.userRepo.findOne({ id: blockId });
    if (!userToBlock) {
      throw new NotFoundException("User with id does not exist");
    }
    user!.blockedUsers?.remove(userToBlock);
    await this.userRepo.getEntityManager().flush();
    return { blocked: false };
  }
  async muteUser(blockId: string, userId: string) {
    const user = await this.userRepo.findOne({ id: userId });
    const userToMute = await this.userRepo.findOne({ id: blockId });
    if (!userToMute) {
      throw new NotFoundException("User with id does not exist");
    }
    user!.mutedUsers?.add(userToMute);
    await this.userRepo.getEntityManager().flush();
    return { muted: true };
  }
  async unmuteUser(blockId: string, userId: string) {
    const user = await this.userRepo.findOne({ id: userId });
    const userToMute = await this.userRepo.findOne({ id: blockId });
    if (!userToMute) {
      throw new NotFoundException("User with id does not exist");
    }
    user!.mutedUsers?.add(userToMute);
    await this.userRepo.getEntityManager().flush();
    return { muted: false };
  }
}
