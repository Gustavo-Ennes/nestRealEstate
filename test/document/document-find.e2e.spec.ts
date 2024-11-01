import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { findOneQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';
import { ERole } from '../../src/application/auth/role/role.enum';

describe('Document Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let document: Document;

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Documents');
    await sequelize.sync({ force: true });

    document = await Document.create({
      type: EDocumentType.CNPJ,
      ownerRole: ERole.Tenant,
      ownerId: 1,
      url: 'some.url.com',
    });
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should find a document with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
        variables: { input: document.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('document');
    expect(res.body.data.document).toHaveProperty('type', document.type);
    expect(res.body.data.document).toHaveProperty(
      'ownerRole',
      document.ownerRole,
    );
    expect(res.body.data.document).toHaveProperty('ownerId', document.ownerId);
    expect(res.body.data.document).toHaveProperty('status', document.status);
    expect(res.body.data.document).toHaveProperty(
      'observation',
      document.observation,
    );
    expect(res.body.data.document).toHaveProperty('createdAt');
    expect(res.body.data.document).toHaveProperty('updatedAt');
  });

  it('should find a document with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findOneQuery,
        variables: { input: document.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('document');
    expect(res.body.data.document).toHaveProperty('type', document.type);
    expect(res.body.data.document).toHaveProperty(
      'ownerRole',
      document.ownerRole,
    );
    expect(res.body.data.document).toHaveProperty('ownerId', document.ownerId);
    expect(res.body.data.document).toHaveProperty('status', document.status);
    expect(res.body.data.document).toHaveProperty(
      'observation',
      document.observation,
    );
    expect(res.body.data.document).toHaveProperty('createdAt');
    expect(res.body.data.document).toHaveProperty('updatedAt');
  });

  it('should find a document with tenant role', async () => {
    token = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
        variables: { input: document.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('document');
    expect(res.body.data.document).toHaveProperty('type', document.type);
    expect(res.body.data.document).toHaveProperty(
      'ownerRole',
      document.ownerRole,
    );
    expect(res.body.data.document).toHaveProperty('ownerId', document.ownerId);
    expect(res.body.data.document).toHaveProperty('status', document.status);
    expect(res.body.data.document).toHaveProperty(
      'observation',
      document.observation,
    );
    expect(res.body.data.document).toHaveProperty('createdAt');
    expect(res.body.data.document).toHaveProperty('updatedAt');
  });

  it('should find a document with landlord role', async () => {
    token = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
        variables: { input: document.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('document');
    expect(res.body.data.document).toHaveProperty('type', document.type);
    expect(res.body.data.document).toHaveProperty(
      'ownerRole',
      document.ownerRole,
    );
    expect(res.body.data.document).toHaveProperty('ownerId', document.ownerId);
    expect(res.body.data.document).toHaveProperty('status', document.status);
    expect(res.body.data.document).toHaveProperty(
      'observation',
      document.observation,
    );
    expect(res.body.data.document).toHaveProperty('createdAt');
    expect(res.body.data.document).toHaveProperty('updatedAt');
  });

  it('should return null if no tenant exists', async () => {
    const id = document.id;
    await document.destroy();

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
        variables: { input: id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('document');
    expect(res.body.data.document).toBeNull();
  });
});
