import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDTO, SignUpDTO } from "./dtos";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("/signIn")
  async signIn(@Body() body: SignInDTO) {
    return await this.authService.signIn(body.username, body.password);
  }
  @Post("/signUp")
  async signUp(
    @Body()
    body: SignUpDTO,
  ) {
    return await this.authService.signUp(
      body.username,
      body.email,
      body.password,
      body.imageId,
    );
  }
  @Post("/refreshKey")
  async refreshKey() {}
}
