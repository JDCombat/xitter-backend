import { wrap } from "@mikro-orm/core";
import { Injectable, NotFoundException } from "@nestjs/common";
import { writeFile } from "fs/promises";
import path from "path";
import { MediaRepository } from "src/db/repositories/MediaRepository";

@Injectable()
export class MediaService {
  constructor(private readonly repo: MediaRepository) {}
  async uploadFile(file: Express.Multer.File, type: string) {
    const fileName = crypto.randomUUID() + file.mimetype.split("/")[1];
    const savePath = path.join("uploads", fileName);
    await writeFile(savePath, file.buffer);
    const media = this.repo.create({
      name: fileName,
      mimeType: file.mimetype,
      type: type as "profilePicture" | "postAttachment",
    });
    await this.repo.getEntityManager().flush();
    return wrap(media);
  }
  async getFile(id: string) {
    const file = await this.repo.findOne({ id });
    if (!file) {
      throw new NotFoundException("File with id does not exist");
    }
  }
}
