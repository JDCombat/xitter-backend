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
    image: () => p.oneToOne(MediaSchema).nullable().owner(),
    posts: () => p.oneToMany(PostSchema).mappedBy("author"),
    reposts: () => p.manyToMany(PostSchema),
    following: () => p.manyToMany(UserSchema).inversedBy("followers").nullable(),
    followers: () => p.manyToMany(UserSchema).mappedBy("following").nullable(),
    likes: () => p.manyToMany(PostSchema).nullable(),
    blockedUsers: () => p.manyToMany(UserSchema).nullable(),
    mutedUsers: () => p.manyToMany(UserSchema).nullable(),
  },
});
export type IUser = InferEntity<typeof UserSchema>;
