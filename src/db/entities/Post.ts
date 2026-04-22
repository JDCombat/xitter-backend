import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { HashtagSchema } from "./Hashtags";
import { UserSchema } from "./User";
import { PostRepository } from "src/db/repositories/postRepository";
import { MediaSchema } from "./Media";

export const PostSchema = defineEntity({
  name: "Post",
  extends: BaseEntitySchema,
  repository: () => PostRepository,
  properties: {
    content: p.text().length(2000).nullable(),
    likes: () =>
      p
        .manyToMany(UserSchema)
        .nullable(),
    likesCount: p.formula(alias => `(select count(*) from post_likes pl where pl.post_id = ${alias.toString()}.id)`).persist(false).type(Number),
    repostsCount: p.formula(alias => `(select count(*) from post_reposts pr where pr.post_id = ${alias.toString()}.id)`).persist(false).type(Number),
    media: () =>
      p.oneToMany(MediaSchema).mappedBy("post").nullable(),
    hashtags: () =>
      p
        .manyToMany(HashtagSchema)
        .nullable(),
    author: () => p.manyToOne(UserSchema),
    repliesTo: () =>
      p
        .oneToOne(PostSchema)
        .nullable(),
    originalPost: () => p.manyToOne(PostSchema).nullable()
  },
});
export type IPost = InferEntity<typeof PostSchema>;
