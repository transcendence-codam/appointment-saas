import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // this setting should always be consistent with frontend/vite.config.ts
  app.setGlobalPrefix('api');

  // swagger configuration
  const config = new DocumentBuilder()
    .setTitle('appointment-saas-api')
    .setDescription('our project internal docs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
