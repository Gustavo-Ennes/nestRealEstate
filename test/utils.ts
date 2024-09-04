import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../src/app.module';

export const generateToken = (user = { sub: 1, role: 'admin' }) => {
  return sign(
    {
      sub: user.sub,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );
};

export const requestAndCheckError =
  (path: string) =>
  async ({
    app,
    token = null,
    query,
    variables,
    property,
    constraints = null,
    code = 'BAD_REQUEST',
  }) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query,
        variables,
      })
      .expect(200);

    const originalErrorMessageIsArray = Array.isArray(
      res.body.errors[0].extensions.originalError.message,
    );

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('path', [path]);
    expect(res.body.errors[0].extensions).toHaveProperty('code', code);
    if (originalErrorMessageIsArray) {
      expect(
        res.body.errors[0].extensions.originalError.message[0],
      ).toHaveProperty('property', property);
      expect(
        res.body.errors[0].extensions.originalError.message[0],
      ).toHaveProperty('constraints', constraints);
    }
  };

export const initApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const sequelize = app.get<Sequelize>(Sequelize);
  const token = generateToken();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        );
      },
    }),
  );
  await app.init();

  return { application: app, db: sequelize, adminToken: token };
};
