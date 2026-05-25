import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenBlacklistService {
  constructor(private readonly jwt: JwtService) {}

  private readonly blacklist = new Set<string>();

  invalidate(token: string): void {
    this.blacklist.add(token);
    console.log(this.blacklist)

    try {
      const payload = this.jwt.decode(token) as { exp?: number };
      console.log(payload)
      if (payload?.exp) {
        const msUntilExpiry = payload.exp * 1000 - Date.now();
        console.log(msUntilExpiry)
        if (msUntilExpiry > 0) {
          setTimeout(() => this.blacklist.delete(token), msUntilExpiry);
        }
      }
    } catch {
    }
  }

  isBlacklisted(token: string): boolean {
    console.log(this.blacklist)
    return this.blacklist.has(token);
  }
}
