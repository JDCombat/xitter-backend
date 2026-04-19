import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { HashtagSchema } from "./Hashtags";
import { UserSchema } from "./User";
import { PostRepository } from "src/db/repositories/postRepository";

export const PostSchema = defineEntity({
  name: "Post",
  extends: BaseEntitySchema,
  repository: () => PostRepository,
  properties: {
    content: p.text().length(2000),
    likes: p.bigint().onCreate(() => BigInt(0)),
    media: p.array().nullable(),
    hashtags: () =>
      p
        .manyToMany(HashtagSchema)
        .nullable()
        .serializer((value) => value.name),
    author: () => p.manyToOne(UserSchema).serializer((value) => value.tag),
    repliesTo: () =>
      p
        .oneToOne(PostSchema)
        .nullable()
        .serializer((value) => value.id),
    reposters: () => p.manyToMany(UserSchema)
  },
});
export type IPost = InferEntity<typeof PostSchema>;
