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
    email: p.string().unique(),
    password: p.string().hidden().ref().lazy(),
    image: () =>
      p
        .oneToOne(MediaSchema)
        .where({ type: "profilePicture" })
        .nullable()
        .owner(),
    posts: () => p.oneToMany(PostSchema).mappedBy("author"),
    reposts: () => p.manyToMany(PostSchema),
    following: () => p.manyToMany(UserSchema).inversedBy("followers"),
    followers: () => p.manyToMany(UserSchema).mappedBy("following"),
  },
});
export type IUser = InferEntity<typeof UserSchema>;
