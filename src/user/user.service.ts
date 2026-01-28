import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { QueryUserDto } from './dto/query.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>) { }

  async create(dto: CreateUserDto) {
    const { email, password, name } = dto;

    const exists = await this.repo.exists({ where: { email } })
    if (exists) throw new ConflictException('email already exists')

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.repo.create({
      email,
      name,
      password: passwordHash,
      role: 'user'
    });
    return this.repo.save(user)
  }

  async findAll(query: QueryUserDto) {
    const { page, limit, search } = query;

    const [items, total] = await this.repo.findAndCount({
      where: search ? [
        { name: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) }
      ]: {},
      order: { id: 'ASC'},
      take: limit,
      skip: (page - 1) * limit
    });
    return { total, page, limit, items }
  } 

  async findOne(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`user with id ${id} not found`)
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.repo.findOneBy({id})
    if(!user) throw new NotFoundException('user not found')
      if (dto.name) user.name = dto.name
    return this.repo.save(user)
  }

  async remove(id: number) {
    const res =  await this.repo.softDelete(id)
    if (!res.affected) throw new NotFoundException('user not found')
      return;
  }
}
