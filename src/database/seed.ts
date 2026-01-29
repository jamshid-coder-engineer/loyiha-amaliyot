import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entity/user.entity';

export async function seedAdmin(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  const exists = await repo.findOne({ where: { email: 'admin@test.com' } });
  if (exists) return;

  const password = await bcrypt.hash('admin123', 10);

  await repo.save(
    repo.create({
      email: 'admin@test.com',
      password: password,
      name: 'Super Admin',
      role: 'admin',
    }),
  );

  console.log('Admin user created');
}
