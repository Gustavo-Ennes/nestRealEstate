import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../../src/app.module';
import { Tenant } from '../../src/tenant/entities/tenant.entity';
import { findOneQuery, findAllQuery } from './queries';
import { generateToken } from './utils';

describe('Tenant Module - find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    sequelize = app.get<Sequelize>(Sequelize);
    token = generateToken();

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

    await sequelize.getQueryInterface().dropTable('Tenants');
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should find a tenant with admin role', async () => {
    const tenantInput = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'tenant@tenant.com',
      phone: '1231231232',
    };
    await Tenant.create(tenantInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.data).toEqual({ tenant: { id: 1, ...tenantInput } });
  });

  it('should not find a tenant with tenant role', async () => {
    token = generateToken({ sub: 1, role: 'tenant' });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });

  it('should find all tenants with admin role', async () => {
    const tenantInput = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'tenant@tenant.com',
      phone: '1231231232',
    };
    await Tenant.create(tenantInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toEqual({ tenants: [{ id: 1, ...tenantInput }] });
  });

  it('should not find all tenants with tenant role', async () => {
    token = generateToken({ sub: 1, role: 'tenant' });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });
});
