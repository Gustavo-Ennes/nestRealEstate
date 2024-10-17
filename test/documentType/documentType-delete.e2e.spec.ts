import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { generateToken, initApp } from '../utils';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { ERole } from '../../src/application/auth/role/role.enum';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';

describe('DocumentType Module - Delete (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let documentType: DocumentType;

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('DocumentTypes');
    await sequelize.sync({ force: true });

    documentType = await DocumentType.create({
      name: EDocumentType.CNPJ,
      legalType: ELegalType.Legal,
    });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete a document type with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { id: documentType.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('removeDocumentType');
    expect(res.body.data.removeDocumentType).toBeTruthy();
  });

  it('should not delete a document type with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: deleteMutation,
        variables: { id: documentType.id },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not delete a document type with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: deleteMutation,
        variables: { id: documentType.id },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should throw if document type not found', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { id: 666 },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'INTERNAL_SERVER_ERROR',
    );
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'DocumentType not found for document id 666',
      error: 'Not Found',
      statusCode: 404,
    });
  });
});
