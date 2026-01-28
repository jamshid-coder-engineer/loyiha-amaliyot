import { Controller, Body, Post, Get, Param, ParseIntPipe, Query, Delete, HttpCode, Patch } from '@nestjs/common';
import { UserService } from './user.service';

import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import type { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role-enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto)
  }

  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
  }

}
