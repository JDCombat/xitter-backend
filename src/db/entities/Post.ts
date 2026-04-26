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
    likesCount: p.integer().default(0),
    repostsCount: p.integer().default(0),
    replyCount: p.integer().default(0),
    likes: () => p.manyToMany(UserSchema).nullable(),
    media: () => p.oneToMany(MediaSchema).mappedBy("post").nullable(),
    hashtags: () => p.manyToMany(HashtagSchema).nullable(),
    author: () => p.manyToOne(UserSchema),
    repliesTo: () => p.manyToOne(PostSchema).nullable(),
    reposts: () => p.manyToOne(PostSchema).nullable(),
  },
});
export type IPost = InferEntity<typeof PostSchema>;
