import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { MediaRepository } from "../repositories/MediaRepository";

export const MediaSchema = defineEntity({
  name: "Media",
  extends: BaseEntitySchema,
  repository: () => MediaRepository,
  properties: {
    name: p.text().unique(),
    type: p.enum(["profilePicture", "postAttachment"]),
    mimeType: p.text(),
  },
});
export type IMedia = InferEntity<typeof MediaSchema>;
