/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsUUID, MaxLength } from "class-validator";

export class PostDataDTO{
  @IsNotEmpty()
  content: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID("all", {each: true})
  mediaIds?: string[];
}