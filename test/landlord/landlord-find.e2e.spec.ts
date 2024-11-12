import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { Landlord } from '../../src/domain/landlord/entities/landlord.entity';
import { findOneQuery, findAllQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';
import { Client } from '../../src/application/client/entities/client.entity';
import { clientInput } from '../client/utils';
import { landlordInput } from './utils';
import { addressInput } from '../address/utils';
import { Address } from '../../src/application/address/entities/address.entity';

describe('Landlord Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeAll(async () => {
    const { application, adminToken, db } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Landlords');
    await sequelize.sync({ force: true });
    await Address.create(addressInput);
    await Client.create(clientInput);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should find a landlord with admin role', async () => {
    const documentInput = {
      ownerId: 1,
      ownerRole: ERole.Landlord,
      type: EDocumentType.Cpf,
    };

    await Landlord.create(landlordInput);
    await Document.create(documentInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('landlord');
    expect(res.body.data.landlord).toHaveProperty('id', 1);
    expect(res.body.data.landlord).toHaveProperty('name', landlordInput.name);
    expect(res.body.data.landlord).toHaveProperty('phone', landlordInput.phone);
    expect(res.body.data.landlord).toHaveProperty('email', landlordInput.email);
    expect(res.body.data.landlord).toHaveProperty(
      'clientId',
      landlordInput.clientId,
    );
    expect(res.body.data.landlord).toHaveProperty(
      'addressId',
      landlordInput.addressId,
    );
    expect(res.body.data.landlord).toHaveProperty('client', { id: 1 });
    expect(res.body.data.landlord).toHaveProperty('address', { id: 1 });
    expect(res.body.data.landlord).toHaveProperty('createdAt');
    expect(res.body.data.landlord).toHaveProperty('updatedAt');
  });

  it('should find a landlord with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const documentInput = {
      ownerId: 1,
      ownerRole: ERole.Landlord,
      type: EDocumentType.Cpf,
    };

    await Landlord.create(landlordInput);
    await Document.create(documentInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('landlord');
    expect(res.body.data.landlord).toHaveProperty('id', 1);
    expect(res.body.data.landlord).toHaveProperty('name', landlordInput.name);
    expect(res.body.data.landlord).toHaveProperty('phone', landlordInput.phone);
    expect(res.body.data.landlord).toHaveProperty('email', landlordInput.email);
    expect(res.body.data.landlord).toHaveProperty(
      'clientId',
      landlordInput.clientId,
    );
    expect(res.body.data.landlord).toHaveProperty(
      'addressId',
      landlordInput.addressId,
    );
    expect(res.body.data.landlord).toHaveProperty('client', { id: 1 });
    expect(res.body.data.landlord).toHaveProperty('address', { id: 1 });
    expect(res.body.data.landlord).toHaveProperty('createdAt');
    expect(res.body.data.landlord).toHaveProperty('updatedAt');
  });

  it('should not find a landlord with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
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

  it('should find all landlords with admin role', async () => {
    await Landlord.create(landlordInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('landlords');
    expect(res.body.data.landlords).toHaveLength(1);
    expect(res.body.data.landlords[0]).toHaveProperty('id', 1);
    expect(res.body.data.landlords[0]).toHaveProperty(
      'name',
      landlordInput.name,
    );
    expect(res.body.data.landlords[0]).toHaveProperty(
      'phone',
      landlordInput.phone,
    );
    expect(res.body.data.landlords[0]).toHaveProperty(
      'email',
      landlordInput.email,
    );
    expect(res.body.data.landlords[0]).toHaveProperty(
      'clientId',
      landlordInput.clientId,
    );
    expect(res.body.data.landlords[0]).toHaveProperty(
      'addressId',
      landlordInput.addressId,
    );
    expect(res.body.data.landlords[0]).toHaveProperty('client', { id: 1 });
    expect(res.body.data.landlords[0]).toHaveProperty('address', { id: 1 });
    expect(res.body.data.landlords[0]).toHaveProperty('createdAt');
    expect(res.body.data.landlords[0]).toHaveProperty('updatedAt');
  });

  it('should not find all landlords with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
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
