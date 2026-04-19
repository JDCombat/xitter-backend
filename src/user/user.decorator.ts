import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type UserPayload = { sub: number; username: string };

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: UserPayload }>();
    return request.user;
  },
);
