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

@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}
  @UseInterceptors(FileInterceptor("file"))
  @Post("/upload")
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15000 }),
          new FileTypeValidator({ fileType: /(image|video)\/\w+/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body("type") type: string,
  ) {
    return this.service.uploadFile(file, type);
  }

  @Get("/:id")
  async getMedia(@Param("id", ParseUUIDPipe) id: string) {}
}
