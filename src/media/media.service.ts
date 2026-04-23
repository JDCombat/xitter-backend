import { wrap } from "@mikro-orm/core";
import { Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { createReadStream } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { MediaRepository } from "src/db/repositories/MediaRepository";

@Injectable()
export class MediaService {
  constructor(private readonly repo: MediaRepository) {}
  async uploadFile(file: Express.Multer.File, userId: string) {
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
    const file = await this.repo.findOne({ id }, {fields: ["name", "mimeType"]});
    if (!file) {
      throw new NotFoundException("File with id does not exist");
    }
    const stream = createReadStream(path.join(process.cwd(), "uploads", file.name));
    return new StreamableFile(stream, {
      type: file.mimeType,
    });
  }
}
