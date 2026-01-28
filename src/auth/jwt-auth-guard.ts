import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            throw new UnauthorizedException('no token')
        }
        const token = auth.split(' ')[1]
        console.log(token);
        try {
            const payload = this.jwtService.verify(token)
            request.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('invalid token')
        }
    }
}