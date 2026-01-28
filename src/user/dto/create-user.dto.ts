import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({example: 'Ali'})
    @IsString()
    @MinLength(2, { message: 'name 2 ta bolsin'})
    name: string;
}
