import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { findOneQuery, findAllQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { Client } from '../../src/application/client/entities/client.entity';
import { clientInput } from './utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { addressInput } from '../address/utils';

describe('Client Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let superAdminToken: string;
  let client: Client;

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    superAdminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Clients');
    await sequelize.sync({ force: true });

    await Address.create(addressInput);
    client = await Client.create(clientInput);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should find all clients with superadmin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('clients');
    expect(res.body.data.clients[0]).toHaveProperty('id', 1);
    expect(res.body.data.clients[0]).toHaveProperty('name', clientInput.name);
    expect(res.body.data.clients[0]).toHaveProperty('phone', clientInput.phone);
    expect(res.body.data.clients[0]).toHaveProperty('email', clientInput.email);
    expect(res.body.data.clients[0]).toHaveProperty('site', clientInput.site);
    expect(res.body.data.clients[0]).toHaveProperty('cnpj', clientInput.cnpj);
    expect(res.body.data.clients[0]).toHaveProperty(
      'isActive',
      clientInput.isActive,
    );
    expect(res.body.data.clients[0]).toHaveProperty('addressId', 1);
    expect(res.body.data.clients[0]).toHaveProperty('address', {
      id: 1,
    });
    expect(res.body.data.clients[0]).toHaveProperty('createdAt');
    expect(res.body.data.clients[0]).toHaveProperty('updatedAt');
  });

  it('should not find all clients with admin role', async () => {
    const adminToken = generateToken({ sub: 1, role: ERole.Admin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      originalError: {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    });
  });
  it('should not find all clients with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      originalError: {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    });
  });

  it('should not find all clients with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      originalError: {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    });
  });

  it('should find a client with any role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findOneQuery,
        variables: { input: client.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('client');
    expect(res.body.data.client).toHaveProperty('id', 1);
    expect(res.body.data.client).toHaveProperty('name', clientInput.name);
    expect(res.body.data.client).toHaveProperty('phone', clientInput.phone);
    expect(res.body.data.client).toHaveProperty('email', clientInput.email);
    expect(res.body.data.client).toHaveProperty('site', clientInput.site);
    expect(res.body.data.client).toHaveProperty('cnpj', clientInput.cnpj);
    expect(res.body.data.client).toHaveProperty(
      'isActive',
      clientInput.isActive,
    );
    expect(res.body.data.client).toHaveProperty('addressId', 1);
    expect(res.body.data.client).toHaveProperty('address', {
      id: 1,
    });
    expect(res.body.data.client).toHaveProperty('createdAt');
    expect(res.body.data.client).toHaveProperty('updatedAt');
  });

  it('should throw if a client is not found(findOne)', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findOneQuery,
        variables: { input: 666 },
      })
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('client', null);
  });
});
