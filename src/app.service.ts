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
      { populate: ["mutedUsers", "blockedUsers", "likes", "following"], fields: ["mutedUsers", "blockedUsers", "likes", "following"] },
    ))!;
    const posts = await this.em.find(
      PostSchema,
      {
        $and: [
          { author: { id: { $nin: user.mutedUsers?.getIdentifiers()} } },
          { author: { id: { $nin: user.blockedUsers?.getIdentifiers()} } },
          { author: { blockedUsers: { $none: userId } } },
          { author: { $ne: userId } },
        ],
      },
      { limit: 15, populate: ["media", "author", "author.blockedUsers"], orderBy: {createdAt: "DESC"} },
    );
    for (const post of posts){
      let score = 0;
      const authorLikes = user.likes?.toArray().filter((e) => e.author.id == post.author.id).length ?? 0
      score += authorLikes
      score += user.following?.contains(post.author) ? 100: 0
      post.score = score
    }
    return posts
  }
}
