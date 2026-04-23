import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "src/db/repositories/userRepository";
import bcrypt from "bcrypt";

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
    imageId?: string,
  ) {
    const potentialUser = await this.repo.findOne({
      $or: [{ name: username }, { email: email }],
    });
    if (potentialUser) {
      throw new ConflictException("User with name or mail already exists");
    }

    const tag = username.toLocaleLowerCase().replace(" ", "_");

    const hash = await bcrypt.hash(password, 10);
    const user = this.repo.create({
      name: username,
      tag: tag,
      email: email,
      password: hash,
      image: imageId,
    });
    await this.repo.getEntityManager().flush();
    return user;
  }
  async refreshToken() {
    
  }
}
