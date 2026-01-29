import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { seedAdmin } from './database/seed';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  app.setGlobalPrefix('api/v1')

  const config = new DocumentBuilder()
  .setTitle('NestJs Api')
  .setDescription('Backend Api Documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build()
  
const document = SwaggerModule.createDocument(app, config)
SwaggerModule.setup('api/docs', app, document)

  const dataSource = app.get(DataSource);
  await seedAdmin(dataSource)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
