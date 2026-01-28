import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  private user = {
    id: 1,
    email: 'admin@test.com',
    passwordHash: bcrypt.hashSync('123456', 10)
  }

  constructor(private jwtService: JwtService) { }

  async validateUser(email: string, password: string) {
    if (email !== this.user.email)
      throw new UnauthorizedException('invalid')


    const isMatch = await bcrypt.compare(password, this.user.passwordHash)
    if (!isMatch)
      throw new UnauthorizedException('invalid')

    return { id: this.user.id, email: this.user.email }
  }

  login(user: { id: number, email: string }) {
    const payload = { sub: user.id, email: user.email }
    return {
      accessToken: this.jwtService.sign(payload)
    };
  }
}
