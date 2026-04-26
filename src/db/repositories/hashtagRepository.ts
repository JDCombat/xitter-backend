import { EntityRepository } from "@mikro-orm/postgresql";
import { IHashtag } from "src/db/entities/Hashtags";
import { PostSchema } from "../entities/Post";

export class HashtagRepository extends EntityRepository<IHashtag> {
  async countFromPastHour(name: string) {
    return await this.em.count(
      PostSchema,
      {
        hashtags: { $some: { name } },
        createdAt: { $gt: new Date(Date.now() - 1000 * 60 * 60) },
      },
      { populate: ["hashtags"] },
    );
  }
  async avgCountFromPastDay(name: string) {
    return (
      (await this.em.count(
        PostSchema,
        {
          hashtags: { $some: { name } },
          createdAt: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
        },
        { populate: ["hashtags"] },
      )) / 24
    );
  }
  async uniqueUsers(name: string) {
    return await this.em.count(
      PostSchema,
      {
        hashtags: { $some: { name } },
        createdAt: { $gt: new Date(Date.now() - 1000 * 60 * 60) },
      },
      { populate: ["author"], groupBy: "author" },
    );
  }
}
