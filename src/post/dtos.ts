import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";

export class PostDataDTO {
  @IsNotEmpty()
  content: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID("all", { each: true })
  mediaIds?: string[];
}
