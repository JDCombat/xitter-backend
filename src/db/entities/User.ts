import { defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { UserRepository } from "src/db/repositories/userRepository";
import { PostSchema } from "./Post";
import { MediaSchema } from "./Media";

export const UserSchema = defineEntity({
  name: "Users",
  extends: BaseEntitySchema,
  repository: () => UserRepository,
  properties: {
    name: p.string(),
    tag: p.string().unique(),
    email: p.string().unique().hidden(),
    password: p.string().hidden().ref().lazy(),
    active: p.boolean().hidden().default(false),
    activation_hash: p.string().hidden().nullable(),
    change_hash: p.string().hidden().nullable(),
    refresh_version: p
      .integer()
      .onCreate(() => 0)
      .hidden()
      .lazy(),
    image: () => p.oneToOne(MediaSchema).nullable().owner().serializer((value) => value?.url ?? process.env.SERVER_ROOT + "/media/defaultPfp"),
    posts: () => p.oneToMany(PostSchema).mappedBy("author"),
    following: () =>
      p.manyToMany(UserSchema).inversedBy("followers").nullable(),
    followers: () => p.manyToMany(UserSchema).mappedBy("following").nullable(),
    likes: () => p.manyToMany(PostSchema).mappedBy("likes").nullable(),
    blockedUsers: () => p.manyToMany(UserSchema).nullable(),
    mutedUsers: () => p.manyToMany(UserSchema).nullable(),
  },
});
export type IUser = InferEntity<typeof UserSchema>;
