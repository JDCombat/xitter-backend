/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class PostDataDTO{
  @IsNotEmpty()
  content: string;
  @IsOptional()
  @IsUUID()
  mediaId?: string;
}