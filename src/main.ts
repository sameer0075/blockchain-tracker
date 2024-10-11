import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/helper/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  const config = new DocumentBuilder()
    .setTitle('Todo-App Backend')
    .setVersion('1.0')
    .addTag('Todo')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'Authorization' },
      'Authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port: number = parseInt(process.env.PORT) || 5000;
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Origin, X-Requested-With, Content-Type, Accept',
    );
    res.setHeader('Access-Control-Expose-Headers', 'Authorization'); // This allows the browser to access the Authorization header
    next();
  });
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, () => {
    Logger.log(`Backend running on Port ${port}}`);
  });
}
bootstrap();
