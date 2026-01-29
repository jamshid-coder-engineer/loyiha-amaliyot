import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {

  constructor(private jwtService: JwtService,
    private userService: UserService) { }

  async register(dto: { email: string, password: string, name: string }) {
    return this.userService.create(dto)
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmailWithPassword(email)
    if (!user) throw new UnauthorizedException('parol or password xato')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new UnauthorizedException('parol or password xato')
    const { password: _, ...res } = user
    console.log(res);
    return res;
  }

  login (user: {id: number, email:string, role:string}) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    return {
      accessToken: this.jwtService.sign(payload)
    }
  }
}
