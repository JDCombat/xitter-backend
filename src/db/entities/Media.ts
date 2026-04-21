import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { MediaRepository } from "../repositories/MediaRepository";
import { PostSchema } from "./Post";
import { UserSchema } from "./User";

export const MediaSchema = defineEntity({
  name: "Media",
  extends: BaseEntitySchema,
  repository: () => MediaRepository,
  properties: {
    name: p.text().unique(),
    mimeType: p.text(),
    post: () => p.manyToOne(PostSchema).nullable(),
    owner: () => p.manyToOne(UserSchema)
  },
});
export type IMedia = InferEntity<typeof MediaSchema>;
