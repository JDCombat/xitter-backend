import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const BaseEntitySchema = defineEntity({
  name: "BaseEntity",
  properties: {
    id: p
      .uuid()
      .primary()
      .onCreate(() => crypto.randomUUID()),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date())
      .hidden(),
  },
});
export type IBase = InferEntity<typeof BaseEntitySchema>;
