import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { Landlord } from '../../src/domain/landlord/entities/landlord.entity';
import { findOneQuery, findAllQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';
import { CreateClientInput } from '../../src/application/client/dto/create-client.input';
import { Client } from '../../src/application/client/entities/client.entity';

describe('Landlord Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  const landlordInput = {
    name: 'landlord',
    cpf: '12312312322',
    email: 'landlord@landlord.com',
    phone: '1231231232',
    clientId: 1,
  };
  const clientInput: CreateClientInput = {
    cnpj: '12312312312322',
    email: 'client@mail.com',
    isActive: true,
    name: 'Joseph Climber',
    phone: '12312312322',
  };

  beforeAll(async () => {
    const { application, adminToken, db } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Landlords');
    await sequelize.sync({ force: true });
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

    expect(res.body.data).toEqual({
      landlord: {
        id: 1,
        ...landlordInput,
        client: { id: 1 },
        documents: [{ id: 1, type: documentInput.type }],
      },
    });
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

    expect(res.body.data).toEqual({
      landlord: {
        id: 1,
        ...landlordInput,
        client: { id: 1 },
        documents: [{ id: 1, type: documentInput.type }],
      },
    });
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

    expect(res.body.data).toEqual({
      landlords: [{ id: 1, ...landlordInput, client: { id: 1 } }],
    });
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
