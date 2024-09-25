import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { Landlord } from '../../src/domain/landlord/entities/landlord.entity';
import { findOneQuery, findAllQuery } from './queries';
import { generateToken, initApp } from '../utils';
import { EOwnerType } from '../../src/domain/document/enum/owner-type.enum';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';

describe('Landlord Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('Landlords');
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should find a landlord with admin role', async () => {
    const landlordInput = {
      name: 'landlord',
      cpf: '12312312322',
      email: 'landlord@landlord.com',
      phone: '1231231232',
    };
    const documentInput = {
      ownerId: 1,
      ownerType: EOwnerType.Landlord,
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
        documents: [{ id: 1, type: documentInput.type }],
      },
    });
  });

  it('should not find a landlord with tenant role', async () => {
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

  it('should find all landlords with admin role', async () => {
    const landlordInput = {
      name: 'landlord',
      cpf: '12312312322',
      email: 'landlord@landlord.com',
      phone: '1231231232',
    };
    await Landlord.create(landlordInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toEqual({ landlords: [{ id: 1, ...landlordInput }] });
  });

  it('should not find all landlords with tenant role', async () => {
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
