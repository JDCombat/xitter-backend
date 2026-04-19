import { EntityRepository } from "@mikro-orm/postgresql";
import { IPost } from "src/db/entities/Post";

export class PostRepository extends EntityRepository<IPost> {}
