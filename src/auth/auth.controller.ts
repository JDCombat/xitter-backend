import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ChangePassDTO, SignInDTO, SignUpDTO } from "./dtos";
import { type Response, type Request } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBody,
  ApiCookieAuth,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthGuard } from "src/auth.guard";
import { User, type UserPayload } from "src/user/user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Get a short-lived upload token for profile picture upload during registration",
    description: "Returns a 15-minute JWT accepted by POST /media/upload instead of a real access token.",
  })
  @ApiOkResponse({
    schema: { example: { upload_token: "eyJhbGciOiJIUzI1NiJ9..." } },
  })
  @Get("/preRegister")
  async preRegisterToken(@Req() req: Request) {
    return this.authService.getPreRegisterToken(req);
  }

  @ApiOperation({ summary: "Sign in and receive an access token" })
  @ApiBody({ type: SignInDTO })
  @ApiOkResponse({
    description: "Returns JWT access_token; sets httpOnly refresh_token cookie",
    schema: { example: { access_token: "eyJhbGciOiJIUzI1NiJ9..." } },
  })
  @ApiUnauthorizedResponse({ description: "Invalid username or password" })
  @ApiBadRequestResponse({ description: "User is already logged in" })
  @Post("/signin")
  async signIn(
    @Body() body: SignInDTO,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    return await this.authService.signIn(body.username, body.password, res, req);
  }

  @ApiOperation({ summary: "Register a new user account" })
  @ApiBody({ type: SignUpDTO })
  @ApiCreatedResponse({ description: "User created successfully" })
  @ApiConflictResponse({ description: "Username or email already exists" })
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

  @ApiOperation({ summary: "Refresh access token using the refresh_token cookie" })
  @ApiCookieAuth("refresh_token")
  @ApiOkResponse({
    description: "Returns a fresh JWT access_token",
    schema: { example: { access_token: "eyJhbGciOiJIUzI1NiJ9..." } },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid refresh token" })
  @Post("/refresh")
  async refreshKey(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refreshToken(req, res);
  }

  @ApiOperation({ summary: "Log out and invalidate the refresh token" })
  @ApiCookieAuth("refresh_token")
  @ApiOkResponse({ description: "Logged out; refresh_token cookie cleared" })
  @ApiUnauthorizedResponse({ description: "Not logged in" })
  @Post("/logout")
  async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.logOut(req, res);
  }

  @ApiOperation({ summary: "Activate account via email hash" })
  @ApiQuery({ name: "hash", description: "Activation hash sent to the user's email", type: String })
  @ApiOkResponse({ description: "Account activated successfully" })
  @ApiBadRequestResponse({ description: "Invalid activation hash" })
  @Get("/activate")
  async activate(@Query("hash") hash: string){
    return await this.authService.activate(hash)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Send a password-reset email to the authenticated user" })
  @ApiOkResponse({ description: "Password reset email sent" })
  @ApiUnauthorizedResponse({ description: "Not authenticated" })
  @UseGuards(AuthGuard)
  @Get("/resetPassword")
  async sendResetPassword(@User() user: UserPayload){
    return await this.authService.sendResetPass(user.sub);
  }

  @ApiOperation({ summary: "Reset password using the hash from the reset email" })
  @ApiBody({ type: ChangePassDTO })
  @ApiOkResponse({ description: "Password changed successfully" })
  @ApiBadRequestResponse({ description: "Invalid reset hash" })
  @Post("/resetPassword")
  async resetPassword(data: ChangePassDTO){
    return await this.authService.resetPassword(data)
  }
}
