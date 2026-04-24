import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MediaService } from "./media.service";
import { User, type UserPayload } from "src/user/user.decorator";

@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @UseInterceptors(FileInterceptor("file"))
  @Post("/upload")
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15000000 }),
          new FileTypeValidator({ fileType: /(image|video)\/\w+/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @User() user: UserPayload,
  ) {
    return this.service.uploadFile(file, user.sub);
  }

  @Get("/:id")
  async getMedia(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.getFile(id);
  }
}
