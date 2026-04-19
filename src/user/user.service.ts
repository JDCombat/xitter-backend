import { Injectable, NotFoundException } from "@nestjs/common";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import { UserRepository } from "src/db/repositories/userRepository";

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}
  async getById(id: number) {
    return await this.repo.findOneOrFail({ id });
  }
  async getPosts(id: number) {
    const user = await this.repo.findOne({ id }, { populate: ["posts"] });
    if (!user) {
      throw new NotFoundException("User with id does not exist");
    }
    return user.posts;
  }
  async followUser(target: number, user: number) {
    const toFollow = await this.repo.findOne(
      { id: target },
      { populate: ["followers"] },
    );
    const following = await this.repo.findOne(
      { id: user },
      { populate: ["following"] },
    );
    if (!toFollow) {
      throw new NotFoundException("User with id does not exist");
    }
    toFollow.followers.add(following!);
    following?.following.add(toFollow);
    await this.repo.getEntityManager().flush();
  }
  async unfollowUser(targetId: number, userId: number) {
    const toUnfollow = await this.repo.findOne(
      { id: targetId },
      { populate: ["followers"] },
    );
    const following = await this.repo.findOne(
      { id: userId },
      { populate: ["following"] },
    );
    if (!toUnfollow) {
      throw new NotFoundException("User with id does not exist");
    }
    toUnfollow?.followers.remove(following!);
    following?.following.remove(toUnfollow);
    await this.repo.getEntityManager().flush();
  }
  async changeProfilePicture(userId: number, image: File) {
    const user = (await this.repo.findOne({ id: userId }))!;
    if (user.image != "/uploads/default.png") {
      await unlink(user.image);
      await writeFile(user.image, await image.bytes());
    } else {
      const savePath = path.join(
        "/uploads/",
        user.tag + image.type.split("/")[1],
      );
      await writeFile(savePath, await image.bytes());
      user.image = savePath;
    }
    await this.repo.getEntityManager().flush();
  }
  async changeName(userId: number, newName: string) {
    const user = await this.repo.findOne({ id: userId });
    user!.name = newName;
    await this.repo.getEntityManager().flush();
  }
}
