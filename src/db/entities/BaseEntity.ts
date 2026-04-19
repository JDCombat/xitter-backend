import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const BaseEntitySchema = defineEntity({
  name: "BaseEntity",
  properties: {
    id: p.integer().primary(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});
export type IBase = InferEntity<typeof BaseEntitySchema>;
