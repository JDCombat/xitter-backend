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
    name: p.text().unique().hidden(),
    url: p.text().persist(false).getter(true),
    mimeType: p.text(),
    post: () => p.manyToOne(PostSchema).nullable().hidden(),
    owner: () => p.manyToOne(UserSchema),
  },
});
class Media extends MediaSchema.class {
  get url(): string {
    return `${process.env.SERVER_ROOT}/media/${this.name}`;
  }
}
MediaSchema.setClass(Media);
export type IMedia = InferEntity<typeof MediaSchema>;
