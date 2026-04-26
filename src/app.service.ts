import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { IPost, PostSchema } from "./db/entities/Post";
import { UserSchema } from "./db/entities/User";

@Injectable()
export class AppService {
  constructor(private readonly em: EntityManager) {}
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
        populate: ["media", "author", "author.blockedUsers"],
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
