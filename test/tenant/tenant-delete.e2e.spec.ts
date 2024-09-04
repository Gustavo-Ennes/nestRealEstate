import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { generateToken, initApp } from '../utils';
import { Tenant } from '../../src/tenant/entities/tenant.entity';

describe('Tenant Module - Create (e2e)', () => {
  let app: INestApplication,
    sequelize: Sequelize,
    token: string,
    tenant: Tenant;

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('Tenants');
    await sequelize.sync({ force: true });

    tenant = await Tenant.create({
      name: 'tenant',
      email: 'ads@dasd.com',
      phone: '12312312322',
      cpf: '12312312322',
    });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete a tenant with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: tenant.id },
      })
      .expect(200);

    expect(res.body.data).toEqual({ removeTenant: true });
  });

  it('should delete a tenant with tenant role', async () => {
    token = generateToken({ sub: tenant.id, role: 'tenant' });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: tenant.id },
      })
      .expect(200);

    expect(res.body.data).toEqual({ removeTenant: true });
  });

  it('should not delete a tenant with landlord role', async () => {
    token = generateToken({ sub: tenant.id, role: 'landlord' });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: tenant.id },
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });

  it("should throw a 404 if tenant to delete don't exists", async () => {
    await tenant.destroy();

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: tenant.id },
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Tenant not found.',
      error: 'Not Found',
      statusCode: 404,
    });
  });
});
