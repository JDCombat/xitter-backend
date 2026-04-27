import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MediaService } from "./media.service";
import { AuthGuard } from "src/auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import type { Request } from "express";

@ApiTags("media")
@Controller("media")
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload a media file (image or video, max 15 MB)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image or video file (max 15 MB)",
        },
      },
      required: ["file"],
    },
  })
  @ApiCreatedResponse({ description: "Media uploaded; returns media record with URL" })
  @ApiUnauthorizedResponse({ description: "Not authenticated by logging in or pre register token" })
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
    @Req() req: Request,
  ) {
    return this.service.uploadFile(file, req);
  }

  @ApiOperation({ summary: "Retrieve media metadata by UUID" })
  @ApiParam({ name: "id", description: "Media UUID", type: String })
  @ApiOkResponse({ description: "Media metadata including URL" })
  @ApiNotFoundResponse({ description: "Media not found" })
  @Get("/:id")
  async getMedia(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.getFile(id);
  }
}
