import { EntityRepository } from "@mikro-orm/postgresql";
import { IHashtag } from "src/db/entities/Hashtags";

export class HashtagRepository extends EntityRepository<IHashtag> {}
