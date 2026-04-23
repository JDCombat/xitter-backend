import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { PostSchema } from "./db/entities/Post";
import { UserSchema } from "./db/entities/User";

@Injectable()
export class AppService {
  constructor(private readonly em: EntityManager) {}
  async getFeed(userId: string) {
    const user = (await this.em.findOne(
      UserSchema,
      { id: userId },
      { populate: ["mutedUsers", "blockedUsers"], fields: ["mutedUsers", "blockedUsers"] },
    ))!;
    return await this.em.find(
      PostSchema,
      {
        $and: [
          { author: { id: { $nin: user.mutedUsers?.getIdentifiers()} } },
          { author: { id: { $nin: user.blockedUsers?.getIdentifiers()} } },
          { author: { blockedUsers: { $none: userId } } },
          { author: { $ne: userId } },
        ],
      },
      { limit: 10, populate: ["media", "author", "author.blockedUsers"] },
    );
  }
}
