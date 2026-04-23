import { Body, Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth.guard";
import { User, type UserPayload } from "./user/user.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Get("/feed")
  async getFeed(@User() user: UserPayload) {
    return await this.appService.getFeed(user.sub);
  }
}
