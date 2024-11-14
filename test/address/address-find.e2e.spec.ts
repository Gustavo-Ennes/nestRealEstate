import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { generateToken, initApp } from '../utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { ERole } from '../../src/application/auth/role/role.enum';
import { findAllQuery, findOneQuery } from './queries';
import { addressInput } from './utils';

describe('Address module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let address: Address;

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });

    address = await Address.create(addressInput);
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  it('should find all addresses with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('addresses');
    expect(res.body.data.addresses).toHaveLength(1);
    expect(res.body.data.addresses[0]).toHaveProperty('id', 1);
    expect(res.body.data.addresses[0]).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.addresses[0]).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.addresses[0]).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.addresses[0]).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.addresses[0]).toHaveProperty(
      'street',
      addressInput.street,
    );
  });

  it('should not find all addresses with admin role', async () => {
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

  it('should not find all addresses with tenant role', async () => {
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

  it('should not find all addresses with landlord role', async () => {
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

  it('should find one address with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findOneQuery,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('address');
    expect(res.body.data.address).toHaveProperty('id', 1);
    expect(res.body.data.address).toHaveProperty('city', addressInput.city);
    expect(res.body.data.address).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.address).toHaveProperty('number', addressInput.number);
    expect(res.body.data.address).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.address).toHaveProperty('street', addressInput.street);
  });

  it('should find one address with admin role', async () => {
    const adminToken = generateToken({ sub: 1, role: ERole.Admin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: findOneQuery,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('address');
    expect(res.body.data.address).toHaveProperty('id', 1);
    expect(res.body.data.address).toHaveProperty('city', addressInput.city);
    expect(res.body.data.address).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.address).toHaveProperty('number', addressInput.number);
    expect(res.body.data.address).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.address).toHaveProperty('street', addressInput.street);
  });

  it('should find one address with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findOneQuery,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('address');
    expect(res.body.data.address).toHaveProperty('id', 1);
    expect(res.body.data.address).toHaveProperty('city', addressInput.city);
    expect(res.body.data.address).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.address).toHaveProperty('number', addressInput.number);
    expect(res.body.data.address).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.address).toHaveProperty('street', addressInput.street);
  });

  it('should find one address with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findOneQuery,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('address');
    expect(res.body.data.address).toHaveProperty('id', 1);
    expect(res.body.data.address).toHaveProperty('city', addressInput.city);
    expect(res.body.data.address).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.address).toHaveProperty('number', addressInput.number);
    expect(res.body.data.address).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.address).toHaveProperty('street', addressInput.street);
  });

  it('should return undefined if address not found', async () => {
    await address.destroy();
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findOneQuery,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('address', null);
  });
});
