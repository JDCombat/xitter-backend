import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { HashtagRepository } from "src/db/repositories/hashtagRepository";
import { PostSchema } from "./Post";

export const HashtagSchema = defineEntity({
  name: "Hashtags",
  extends: BaseEntitySchema,
  repository: () => HashtagRepository,
  properties: {
    name: p.text().unique(),
    popularity: p.double().onCreate(() => 0),
    posts: () => p.manyToMany(PostSchema).mappedBy("hashtags"),
  },
});
export type IHashtag = InferEntity<typeof HashtagSchema>;
