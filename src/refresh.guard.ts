import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { type Request } from "express";

export class RefreshGuard implements CanActivate{
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    return request.header("Authorization") == process.env.CRON_TOKEN;
  }
}