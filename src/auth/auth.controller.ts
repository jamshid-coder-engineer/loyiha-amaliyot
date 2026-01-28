import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

@Post('login') 
    async login(@Body() dto: loginDto) {
const user = await this.authService.validateUser(
    dto.email,
    dto.password
);
return this.authService.login(user)
    }
}
