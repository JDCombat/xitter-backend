import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PostDataDTO {
  @ApiProperty({ example: "Hello world! #nestjs", description: "Post content (max 2000 chars)" })
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["uuid-1", "uuid-2"],
    description: "Optional list of media UUIDs to attach (max 5)",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID("all", { each: true })
  mediaIds?: string[];
}
