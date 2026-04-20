import { EntityRepository } from "@mikro-orm/postgresql";
import { IMedia } from "../entities/Media";

export class MediaRepository extends EntityRepository<IMedia> {}
