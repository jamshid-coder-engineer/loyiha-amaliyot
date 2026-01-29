import { Controller, Body, Post, Get, Param, ParseIntPipe, Query, Delete, HttpCode, Patch } from '@nestjs/common';
import { UserService } from './user.service';

import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';

import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role-enum';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto)
  }

@Get('admin/stats')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
getAdminStats() {
  return {
    message: 'Admin only data',
    time: new Date(),
  };
}

@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@Req() req) {
  return req.user;
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
