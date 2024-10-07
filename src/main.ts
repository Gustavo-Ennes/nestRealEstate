import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 1 }));

  await app.listen(3000);

  new Logger().verbose('Keep coding!');
}
bootstrap();
