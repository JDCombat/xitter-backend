/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsArray, IsNotEmpty, IsOptional, IsUUID, MaxLength } from "class-validator";

export class PostDataDTO{
  @IsNotEmpty()
  content: string;
  @IsOptional()
  @IsArray()
  @MaxLength(5)
  @IsUUID("all", {each: true})
  mediaIds?: string[];
}