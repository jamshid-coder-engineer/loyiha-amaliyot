import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private users: {
    id: number;
    name: string;
  }[] = [];
  private id = 1;

  create(dto: CreateUserDto) {
    const user = {
      id: this.id++,
      name: dto.name
    };
    this.users.push(user);
    return user;
  }

  findAllWithQuery(query: {
    page: number;
    limit: number;
    name?: string;
  }) {
    const { page, limit, name } = query
    let data = [...this.users]

    if (name) {
      data = data.filter(u => u.name.toLowerCase().includes(name.toLowerCase())
      )
    }
    const total = data.length;

    const start = (page - 1) * limit
    const end = start + limit
    const items = data.slice(start, end)

    return {
      total,
      page,
      limit,
      items,
    };
  }

  findOne(id: number) {
    const user = this.users.find(u => u.id === id)
    if (!user) throw new NotFoundException('user not found')
    return user
  }

  update(id: number, dto: UpdateUserDto) {
    const user = this.findOne(id)
    if (dto.name) user.name = dto.name
    return user;
  }

  remove(id: number) {
    const user = this.findOne(id)
    this.users = this.users.filter(u => u.id !== id)
    return { message: `user with id ${id} deleted` }
  }
}
