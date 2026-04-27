import { wrap } from "@mikro-orm/core";
import { Injectable, NotFoundException, StreamableFile, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { createReadStream } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { MediaRepository } from "src/db/repositories/MediaRepository";
import { UserPayload } from "src/user/user.decorator";

@Injectable()
export class MediaService {
  constructor(private readonly repo: MediaRepository, private readonly jwt: JwtService) {}
  async uploadFile(file: Express.Multer.File, req: Request) {
    const rawToken = req.headers.authorization?.split(" ")[1];
    if (!rawToken) {
      throw new UnauthorizedException();
    }

    let userId: string | undefined = undefined;
    try {
      const payload = await this.jwt.verifyAsync<UserPayload & { purpose?: string }>(rawToken);
      if (payload.purpose === "pre-register") {
        userId = undefined;
      } else if (payload.sub) {
        userId = payload.sub;
      } else {
        throw new UnauthorizedException("Invalid token");
      }
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const fileName = crypto.randomUUID() + "." + file.mimetype.split("/")[1];
    const savePath = path.join(process.cwd(), "uploads", fileName);
    await writeFile(savePath, file.buffer);
    const media = this.repo.create({
      name: fileName,
      mimeType: file.mimetype,
      owner: userId,
    });
    await this.repo.getEntityManager().flush();
    return wrap(media);
  }
  async getFile(id: string) {
    if(id == "default"){
      return new StreamableFile(createReadStream(path.join(process.cwd(), "uploads", "default.png")), {type: "image/png"})
    }
    const file = await this.repo.findOne(
      { id },
      { fields: ["name", "mimeType"] },
    );
    if (!file) {
      throw new NotFoundException("File with id does not exist");
    }
    const stream = createReadStream(
      path.join(process.cwd(), "uploads", file.name),
    );
    return new StreamableFile(stream, {
      type: file.mimeType,
    });
  }
}
