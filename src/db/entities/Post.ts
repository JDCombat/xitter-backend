import { Collection, defineEntity, p, type InferEntity } from "@mikro-orm/core";
import { BaseEntitySchema } from "./BaseEntity";
import { HashtagSchema, IHashtag } from "./Hashtags";
import { UserSchema } from "./User";
import { PostRepository } from "src/db/repositories/postRepository";
import { IMedia, MediaSchema } from "./Media";

export const PostSchema = defineEntity({
  name: "Post",
  extends: BaseEntitySchema,
  repository: () => PostRepository,
  properties: {
    createdAt: p.datetime().onCreate(() => new Date()),
    content: p.text().length(2000).nullable(),
    likesCount: p.integer().default(0),
    repostsCount: p.integer().default(0),
    replyCount: p.integer().default(0),
    likes: () => p.manyToMany(UserSchema).nullable(),
    media: () => p.oneToMany(MediaSchema).mappedBy("post").nullable().serializer((value: any) =>{if((value as Collection<IMedia>).isInitialized()) return (value as Collection<IMedia>)?.getItems().map(e => e.url)}).serializedName("mediaURLs"),
    hashtags: () => p.manyToMany(HashtagSchema).nullable().serializer((value: any) => {if((value as Collection<IHashtag>).isInitialized()) return (value as Collection<IHashtag>)?.getItems().map(e => e.name)}).serializedName("hashtags"),
    author: () => p.manyToOne(UserSchema),
    repliesTo: () => p.manyToOne(PostSchema).nullable(),
    reposts: () => p.manyToOne(PostSchema).nullable(),
  },
});
export type IPost = InferEntity<typeof PostSchema>;
