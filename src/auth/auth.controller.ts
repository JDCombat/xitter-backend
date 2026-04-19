import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("/signIn")
  async signIn(@Body() body: { username: string; password: string }) {
    return await this.authService.signIn(body.username, body.password);
  }
  @Post("/signUp")
  async signUp(
    @Body()
    body: {
      username: string;
      email: string;
      password: string;
      image?: File;
    },
  ) {
    return await this.authService.signUp(
      body.username,
      body.email,
      body.password,
      body.image,
    );
  }
}
