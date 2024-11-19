import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { findAllQuery, findOneQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { ERole } from '../../src/application/auth/role/role.enum';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';

describe('DocumentType Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let documentType: DocumentType;

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });

    documentType = await DocumentType.create({
      name: EDocumentType.CNPJ,
      legalType: ELegalType.Legal,
    });
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should find all document types with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentTypes');
    expect(res.body.data.documentTypes).toHaveLength(1);
    expect(res.body.data.documentTypes[0]).toHaveProperty(
      'name',
      documentType.name,
    );
    expect(res.body.data.documentTypes[0]).toHaveProperty(
      'legalType',
      documentType.legalType,
    );
    expect(res.body.data.documentTypes[0]).toHaveProperty('createdAt');
    expect(res.body.data.documentTypes[0]).toHaveProperty('updatedAt');
  });

  it('should find all document types with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentTypes');
    expect(res.body.data.documentTypes).toHaveLength(1);
    expect(res.body.data.documentTypes[0]).toHaveProperty(
      'name',
      documentType.name,
    );
    expect(res.body.data.documentTypes[0]).toHaveProperty(
      'legalType',
      documentType.legalType,
    );
    expect(res.body.data.documentTypes[0]).toHaveProperty('createdAt');
    expect(res.body.data.documentTypes[0]).toHaveProperty('updatedAt');
  });

  it('should find one document type with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
        variables: { id: documentType.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentType');
    expect(res.body.data.documentType).toHaveProperty(
      'name',
      documentType.name,
    );
    expect(res.body.data.documentType).toHaveProperty(
      'legalType',
      documentType.legalType,
    );
    expect(res.body.data.documentType).toHaveProperty('createdAt');
    expect(res.body.data.documentType).toHaveProperty('updatedAt');
  });

  it('should find one document type with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findOneQuery,
        variables: { id: documentType.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentType');
    expect(res.body.data.documentType).toHaveProperty(
      'name',
      documentType.name,
    );
    expect(res.body.data.documentType).toHaveProperty(
      'legalType',
      documentType.legalType,
    );
    expect(res.body.data.documentType).toHaveProperty('createdAt');
    expect(res.body.data.documentType).toHaveProperty('updatedAt');
  });

  it('should find one document type with superadmin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
        variables: { id: documentType.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentType');
    expect(res.body.data.documentType).toHaveProperty(
      'name',
      documentType.name,
    );
    expect(res.body.data.documentType).toHaveProperty(
      'legalType',
      documentType.legalType,
    );
    expect(res.body.data.documentType).toHaveProperty('createdAt');
    expect(res.body.data.documentType).toHaveProperty('updatedAt');
  });

  it('should not find all document types with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not find one document types with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findOneQuery,
        variables: { id: 1 },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not find all document types with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not find one document types with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findOneQuery,
        variables: { id: 1 },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });
});
