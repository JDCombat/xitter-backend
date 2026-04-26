import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDTO, SignUpDTO } from "./dtos";
import { type Response, type Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("/signin")
  async signIn(
    @Body() body: SignInDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.signIn(body.username, body.password, res);
  }
  @Post("/signup")
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
  @Post("/refresh")
  async refreshKey(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refreshToken(req, res);
  }
  @Post("/logout")
  async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.logOut(req, res);
  }
}
