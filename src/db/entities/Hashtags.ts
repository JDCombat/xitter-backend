import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { UserSchema } from "./User";
import { HashtagRepository } from "src/db/repositories/hashtagRepository";

export const HashtagSchema = defineEntity({
  name: "Hashtags",
  extends: BaseEntitySchema,
  repository: () => HashtagRepository,
  properties: {
    name: p.text().unique(),
    popularity: p.decimal("number").onCreate(() => 0),
    posts: () => p.manyToMany(UserSchema),
  },
});
export type IHashtag = InferEntity<typeof HashtagSchema>;
