import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Ali' })
    @IsString()
    @MinLength(2, { message: 'name 2 ta bolsin' })
    name: string;
}
