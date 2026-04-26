import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "src/db/repositories/userRepository";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly repo: UserRepository,
  ) {}
  async signIn(login: string, password: string, res: Response) {
    const user = await this.repo.findOne(
      {
        $or: [{ name: login }, { email: login }],
      },
      { fields: ["*", "refresh_version"] },
    );
    if (!user) {
      throw new UnauthorizedException("Invalid username or password");
    }
    const passwordHash = await user.password.load();
    if (!(await bcrypt.compare(password, passwordHash!))) {
      throw new UnauthorizedException("Invalid password");
    }
    const payload = { sub: user.id, username: user.name };
    const refreshToken = await this.jwt.signAsync(
      { id: user.id, version: user.refresh_version },
      { expiresIn: "7d" },
    );
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
  async refreshToken(req: Request, res: Response) {
    const refresh_token = (req.cookies as { refresh_token: string })
      .refresh_token;
    if (!refresh_token) {
      throw new UnauthorizedException(
        "You have to be logged in (provide a refresh token)",
      );
    }
    const payload = await this.jwt.verifyAsync<{
      id: string;
      version: number;
    }>(refresh_token);
    const user = await this.repo.findOne(
      { id: payload.id },
      { fields: ["name", "refresh_version"] },
    );
    if (payload.version != user?.refresh_version) {
      throw new UnauthorizedException("You already logged out");
    }
    const access_payload = { sub: user.id, username: user.name };
    const refresh_token_update = await this.jwt.signAsync(
      { id: user.id, version: user.refresh_version },
      { expiresIn: "7d" },
    );
    res.cookie("refresh_token", refresh_token_update, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      access_token: await this.jwt.signAsync(access_payload),
    };
  }
  async logOut(userId: string) {
    const user = await this.repo.findOne(
      { id: userId },
      { fields: ["*", "refresh_version"] },
    );
    if (!user) {
      throw new UnauthorizedException("You already logged out");
    }
    user.refresh_version += 1;
    await this.repo.getEntityManager().flush();
  }
}
