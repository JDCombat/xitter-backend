import { defineEntity, p, type InferEntity } from "@mikro-orm/core";

export const XitterPost = defineEntity({
  name: "Post",
  properties: {
    id: p.integer().primary(),
    content: p.text().length(2000),
  },
});
export type IPost = InferEntity<typeof XitterPost>;