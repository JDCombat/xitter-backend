import { wrap } from "@mikro-orm/core";
import { , Injectable, NotFoundException } from "@nestjs/common";
import { MediaRepository } from "src/db/repositories/MediaRepository";
import { UserRepository } from "src/db/repositories/userRepository";

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository, private readonly mediaRepo: MediaRepository) {}
  async getById(id: string) {
    return await this.userRepo.findOneOrFail({ id });
  }
  async getPosts(id: string) {
    const user = await this.userRepo.findOne({ id }, { populate: ["posts"] });
    if (!user) {
      throw new NotFoundException("User with id does not exist");
    }
    return user.posts;
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
    toFollow.followers.add(following!);
    following?.following.add(toFollow);
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
    toUnfollow?.followers.remove(following!);
    following?.following.remove(toUnfollow);
    await this.userRepo.getEntityManager().flush();
  }
  async changeProfilePicture(userId: string, mediaId: string) {
    const user = (await this.userRepo.findOne({ id: userId }))!;
    const media = await this.mediaRepo.findOne({ id: mediaId });
    if(!media){
      throw new NotFoundException("Media with id doesn't exist");
    }
    user.image = media;
    await this.userRepo.getEntityManager().flush();
  }
  async changeName(userId: string, newName: string) {
    const user = await this.userRepo.findOne({ id: userId });
    user!.name = newName;
    await this.userRepo.getEntityManager().flush();
    return user
  }
}
