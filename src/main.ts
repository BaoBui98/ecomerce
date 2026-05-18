import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });


  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('Tài liệu API cho hệ thống E-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:8000/api', 'Kong Gateway')
    .build();

  const document = SwaggerModule.createDocument(app, config);


  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 5050, '0.0.0.0');
}
bootstrap();  