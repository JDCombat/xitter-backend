import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SignUpDTO {
  @ApiProperty({ example: "john_doe", description: "Unique username" })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: "john@example.com", description: "User email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "s3cr3tP@ss!", description: "Account password" })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: "uuid-of-an-uploaded-image", description: "Optional profile picture media UUID" })
  @IsOptional()
  @IsUUID()
  imageId?: string;
}

export class SignInDTO {
  @ApiProperty({ example: "john_doe", description: "Username or email" })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: "s3cr3tP@ss!", description: "Account password" })
  @IsNotEmpty()
  password: string;
}

export class ChangePassDTO{
  @ApiProperty({ example: "6d5321fea8f", description: "Hash provided in mail for changing the password" })
  @IsNotEmpty()
  hash: string;

  @ApiProperty({ example: "6d5321fea8f", description: "New password" })
  @IsNotEmpty
  newPassword: string
}
