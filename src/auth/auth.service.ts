import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "src/db/repositories/userRepository";
import bcrypt from "bcrypt";
import { writeFile } from "fs/promises";
import path from "path";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly repo: UserRepository,
  ) {}
  async signIn(login: string, password: string) {
    const user = await this.repo.findOne({
      $or: [{ name: login }, { email: login }],
    });
    if (!user) {
      throw new UnauthorizedException("Invalid username or password");
    }
    const passwordHash = await user.password.load();
    if (!(await bcrypt.compare(password, passwordHash!))) {
      throw new UnauthorizedException("Invalid password");
    }
    const payload = { sub: user.id, username: user.name };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
  async signUp(
    username: string,
    email: string,
    password: string,
    image?: File,
  ) {
    const user = await this.repo.findOne({
      $or: [{ name: username }, { email: email }],
    });
    if (user) {
      throw new ConflictException("User with name or mail already exists");
    }

    const tag = username.toLocaleLowerCase().replace(" ", "_");

    let savePath: string = "";
    if (image) {
      savePath = path.join("uploads", tag + image.name.split(".")[1]);
      await writeFile(savePath, await image.bytes());
    }

    const hash = await bcrypt.hash(password, 10);
    this.repo.create({
      name: username,
      tag: tag,
      email: email,
      password: hash,
      image: image ? savePath : "uploads/default.jpg",
    });
    await this.repo.getEntityManager().flush();
  }
}
