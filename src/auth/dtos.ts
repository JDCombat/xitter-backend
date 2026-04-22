/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class SignUpDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsOptional()
  @IsUUID()
  imageId?: string;
}
export class SignInDTO {
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
}
