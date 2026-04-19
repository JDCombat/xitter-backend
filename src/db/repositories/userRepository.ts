import { EntityRepository } from "@mikro-orm/postgresql";
import { IUser } from "src/db/entities/User";

export class UserRepository extends EntityRepository<IUser> {}
