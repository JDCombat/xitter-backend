import { Injectable } from "@nestjs/common";
import { HashtagRepository } from "src/db/repositories/hashtagRepository";

@Injectable()
export class HashtagService {
  constructor(private readonly repo: HashtagRepository) {}
  async getAll() {
    return await this.repo.findAll();
  }
  async getPosts(name: string) {
    return (
      (
        await this.repo.findOne(
          { name },
          { populate: ["posts", "posts.media"], fields: ["posts"] },
        )
      )?.posts ?? []
    );
  }
  async getTrending() {
    return await this.repo.findAll({
      limit: 5,
      orderBy: { popularity: "desc" },
    });
  }
  async refresh() {
    const tags = await this.repo.findAll();
    for (const tag of tags) {
      const pastHour = await this.repo.countFromPastHour(tag.name);
      const avg = await this.repo.avgCountFromPastDay(tag.name);
      const unique = await this.repo.uniqueUsers(tag.name);
      tag.popularity = (pastHour / (avg + 1)) * Math.log2(unique + 1);
    }
    await this.repo.getEntityManager().flush();
    return { refreshed: true };
  }
}
