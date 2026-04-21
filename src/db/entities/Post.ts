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
    content: p.text().length(2000),
    likes: () =>
      p
        .manyToMany(UserSchema)
        .nullable(),
    media: () =>
      p.oneToMany(MediaSchema).mappedBy("post").nullable(),
    hashtags: () =>
      p
        .manyToMany(HashtagSchema)
        .nullable(),
    author: () => p.manyToOne(UserSchema).serializer((value) => value.tag),
    repliesTo: () =>
      p
        .oneToOne(PostSchema)
        .nullable(),
    reposters: () => p.manyToMany(UserSchema),
  },
});
export type IPost = InferEntity<typeof PostSchema>;
