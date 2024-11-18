import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { Tenant } from '../../src/domain/tenant/entities/tenant.entity';
import { ERole } from '../../src/application/auth/role/role.enum';
import { tenantInput } from './utils';
import { addressInput } from '../address/utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { clientInput } from '../client/utils';
import { Client } from '../../src/application/client/entities/client.entity';

describe('Tenant Module - Delete (e2e)', () => {
  let app: INestApplication,
    sequelize: Sequelize,
    token: string,
    tenant: Tenant;

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Tenants');
    await sequelize.sync({ force: true });
    await Address.create(addressInput);
    await Client.create(clientInput);
    tenant = await Tenant.create(tenantInput);
  });

  afterAll(async () => {
    await afterAllTests(app);
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

  it('should delete a tenant with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: deleteMutation,
        variables: { input: tenant.id },
      })
      .expect(200);

    expect(res.body.data).toEqual({ removeTenant: true });
  });

  it('should delete a tenant with tenant role', async () => {
    const tenantToken = generateToken({ sub: tenant.id, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: deleteMutation,
        variables: { input: tenant.id },
      })
      .expect(200);

    expect(res.body.data).toEqual({ removeTenant: true });
  });

  it('should not delete a tenant with landlord role', async () => {
    const landlordToken = generateToken({
      sub: tenant.id,
      role: ERole.Landlord,
    });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
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
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: 666 },
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
