import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { QueryUserDto } from './dto/query.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private redis: RedisService
  ) { }

  async create(dto: CreateUserDto) {
    const { email, password, name } = dto;

    const exists = await this.repo.exists({ where: { email } })
    await this.redis.delByPattern('users:list:*')
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
    const { page, limit, search, sortBy, order } = query;

    const cacheKey = `users:list:${page}:${limit}:${search || ''}:${sortBy}:${order}`;

    const cachedData = await this.redis.getJson<any>(cacheKey);
    if (cachedData) {
      return { ...cachedData, fromCache: true };
    }

    const qb = this.repo.createQueryBuilder('u')
      .where('u.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(LOWER(u.name) LIKE :q OR LOWER(u.email) LIKE :q)', {
        q: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();

    const items = await qb
      .orderBy(`u.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const result = {
      total,
      page,
      limit,
      items,
    };

    await this.redis.setJson(cacheKey, result, 60);

    return { ...result, fromCache: false };
  }
  async findByEmailWithPassword(email: string) {
    return await this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role']
    });
  }

  async findOne(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`user with id ${id} not found`)
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.repo.findOneBy({ id })
    await this.redis.delByPattern('users:list:*')
    if (!user) throw new NotFoundException('user not found')
    if (dto.name) user.name = dto.name
    return this.repo.save(user)
  }

  async remove(id: number) {
    const res = await this.repo.softDelete(id)
    await this.redis.delByPattern('users:list:*')
    if (!res.affected) throw new NotFoundException('user not found')
    return;
  }
}
