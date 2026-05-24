import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenBlacklistService {
  constructor(private readonly jwt: JwtService) {}

  private readonly blacklist = new Set<string>();

  invalidate(token: string): void {
    this.blacklist.add(token);

    try {
      const payload = this.jwt.decode(token) as { exp?: number } | null;
      if (payload?.exp) {
        const msUntilExpiry = payload.exp * 1000 - Date.now();
        if (msUntilExpiry > 0) {
          setTimeout(() => this.blacklist.delete(token), msUntilExpiry);
        }
      }
    } catch {
    }
  }

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }
}
