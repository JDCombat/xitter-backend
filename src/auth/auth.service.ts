import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "src/db/repositories/userRepository";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { MediaRepository } from "src/db/repositories/MediaRepository";
import { IMedia } from "src/db/entities/Media";
import { MailerService } from "@nestjs-modules/mailer";
import { createHash, randomBytes } from "crypto";
import { ChangePassDTO } from "./dtos";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly userRepo: UserRepository,
    private readonly mediaRepo: MediaRepository,
    private readonly mailer: MailerService
  ) {}
  async getPreRegisterToken(req: Request) {
    if((req.cookies as {refresh_token: string}).refresh_token){
      throw new BadRequestException("You are already logged in")
    }
    const token = await this.jwt.signAsync(
      { purpose: "pre-register" },
      { expiresIn: "15m" },
    );
    return { upload_token: token };
  }

  async signIn(login: string, password: string, res: Response, req: Request) {
    if((req.cookies as {refresh_token: string}).refresh_token){
      throw new BadRequestException("You are already logged in")
    }
    const user = await this.userRepo.findOne(
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
    const potentialUser = await this.userRepo.findOne({
      $or: [{ name: username }, { email: email }],
    });
    if (potentialUser) {
      throw new ConflictException("User with name or mail already exists");
    }

    const tag = username.toLocaleLowerCase().replace(" ", "_");

    let image: IMedia | null = null;
    let changeOwner = false;
    if (imageId) {
      image = await this.mediaRepo.findOne({ id: imageId }, { populate: ["owner"] });
      if (!image) {
        throw new BadRequestException("Media with id does not exist");
      }
      if (!image.owner) {
        changeOwner = true;
      }
    }

    const mailsTurnedOn = process.env.MAIL_REQUIRED == "1" 

    const hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      name: username,
      tag: tag,
      email: email,
      password: hash,
      image: imageId,
      active: !mailsTurnedOn
    });

    if (changeOwner && image) {
      image.owner = user;
    }

    const activation_hash = createHash("MD5").update(randomBytes(16)).digest('hex');


    if(mailsTurnedOn){
      await this.mailer.sendMail({
        to: email,
        subject: "Xitter account activation",
        from: '"Xitter admin" <noreply@xitter.com>',
        html: `<h1>Hello</h1><p>You just registered on xitter. To activate your account click <a href='http://${process.env.SERVER_ROOT}/auth/activate?hash=${activation_hash}'>here</a></p>`,
      })
      user.activation_hash = activation_hash;
    }
    await this.userRepo.getEntityManager().flush();
    return mailsTurnedOn ? {message: "Check your mail in order to activate your account" }: user
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
    const user = await this.userRepo.findOne(
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
  async logOut(req: Request, res: Response) {
    const refresh_token = (req.cookies as { refresh_token: string })
      .refresh_token;
    if (!refresh_token) {
      throw new UnauthorizedException("You already logged out");
    }
    const payload = await this.jwt.verifyAsync<{ id: string; version: string }>(
      refresh_token,
    );
    const user = await this.userRepo.findOne(
      { id: payload.id },
      { fields: ["refresh_version"] },
    );
    if (!user) {
      throw new UnauthorizedException("You already logged out");
    }
    user.refresh_version += 1;
    res.clearCookie("refresh_token");
    await this.userRepo.getEntityManager().flush();
  }
  async activate(hash: string){
    const user = await this.userRepo.findOne({activation_hash: hash})
    if(!user){
      throw new BadRequestException("This account is already activated or doesn't exist")
    }
    user.activation_hash = null
    user.active = true;
    await this.userRepo.getEntityManager().flush()
  }
  async sendResetPass(userId: string){
    const user = (await this.userRepo.findOne({id: userId}))!
    const resetHash = createHash("MD5").update(randomBytes(16)).digest('hex');
    user.active = false
    user.change_hash = resetHash
    await this.userRepo.getEntityManager().flush()
  }
  async resetPassword(data: ChangePassDTO){
    const user = await this.userRepo.findOne({change_hash: data.hash})
    if(!user){
      throw new BadRequestException("You aren't changing passwords")
    }
    user.change_hash = null;
    let password = await user.password.load()
    password = await bcrypt.hash(data.newPassword, 10)

    await this.userRepo.getEntityManager().flush()

  }
}
