import { IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(2, { message: 'name 2 ta bolsin'})
    name: string;
}
