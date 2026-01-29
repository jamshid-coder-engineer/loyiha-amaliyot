import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private redisService: RedisService,
  ) {}

  async register(dto: { email: string; password: string; name: string }) {
    return this.userService.create(dto);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('parol or password xato');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('parol or password xato');

    const { password: _, ...res } = user;
    return res; // {id,email,role,...}
  }

  // ✅ LOGIN: access + refresh
  async login(user: { id: number; email: string; role: string }) {
    return this.signTokens(user);
  }

  // ✅ REFRESH (rotation)
  async refresh(refreshToken: string) {
    const payload = await this.verifyRefresh(refreshToken);
    const userId = Number(payload.sub);
    const jti = String(payload.jti);

    const key = `rt:${userId}:${jti}`;
    const exists = await this.redisService.getClient().get(key);
    if (!exists) throw new UnauthorizedException('Refresh token invalid');

    // rotation: eski refresh bekor
    await this.redisService.getClient().del(key);

    // user borligini tekshirish
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.signTokens({ id: user.id, email: user.email, role: user.role });
  }

  // ✅ LOGOUT: refresh session delete
  async logout(refreshToken: string) {
    const payload = await this.verifyRefresh(refreshToken);
    const userId = Number(payload.sub);
    const jti = String(payload.jti);

    await this.redisService.getClient().del(`rt:${userId}:${jti}`);
    return { ok: true };
  }

  // ----------------- helpers -----------------

  private async signTokens(user: { id: number; email: string; role: string }) {
    const accessTtl = Number(process.env.ACCESS_TOKEN_TTL || 900);
    const refreshTtl = Number(process.env.REFRESH_TOKEN_TTL || 604800);
    const secret = process.env.JWT_SECRET;

    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jti = randomUUID();

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret,
      expiresIn: accessTtl,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, jti },
      { secret, expiresIn: refreshTtl },
    );

    // Redis session
    await this.redisService
      .getClient()
      .set(`rt:${user.id}:${jti}`, '1', 'EX', refreshTtl);

    return { accessToken, refreshToken };
  }

  private async verifyRefresh(token: string) {
    try {
      const secret = process.env.JWT_SECRET;
      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (!payload?.sub || !payload?.jti) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }
}
