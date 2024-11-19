import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { updateMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { ERole } from '../../src/application/auth/role/role.enum';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';
import { UpdateDocumentTypeInput } from '../../src/domain/document-type/dto/update-document-type.input';

describe('DocumentType Module - Update (e2e)', () => {
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

  it('should update a document type with admin role', async () => {
    const input: UpdateDocumentTypeInput = {
      id: documentType.id,
      legalType: ELegalType.Natural,
      name: EDocumentType.Certificate,
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('updateDocumentType');
    expect(res.body.data.updateDocumentType).toHaveProperty('name', input.name);
    expect(res.body.data.updateDocumentType).toHaveProperty(
      'legalType',
      input.legalType,
    );
    expect(res.body.data.updateDocumentType).toHaveProperty('createdAt');
    expect(res.body.data.updateDocumentType).toHaveProperty('updatedAt');
  });

  it('should update a document type with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const input: UpdateDocumentTypeInput = {
      id: documentType.id,
      legalType: ELegalType.Natural,
      name: EDocumentType.Certificate,
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('updateDocumentType');
    expect(res.body.data.updateDocumentType).toHaveProperty('name', input.name);
    expect(res.body.data.updateDocumentType).toHaveProperty(
      'legalType',
      input.legalType,
    );
    expect(res.body.data.updateDocumentType).toHaveProperty('createdAt');
    expect(res.body.data.updateDocumentType).toHaveProperty('updatedAt');
  });

  it('should not update a document type with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const input: UpdateDocumentTypeInput = {
      id: documentType.id,
      legalType: ELegalType.Natural,
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not update a document type with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const input: UpdateDocumentTypeInput = {
      id: documentType.id,
      legalType: ELegalType.Natural,
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: updateMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not update a document type with an invalid actor type', async () => {
    const input: UpdateDocumentTypeInput = {
      id: documentType.id,
      legalType: 'musician',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: [
        {
          property: 'legalType',
          constraints: {
            isActorType: `${input.legalType} isn't a valid actor type.`,
          },
        },
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should not update a document type with an empty name', async () => {
    const input: UpdateDocumentTypeInput = {
      id: documentType.id,
      name: '',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: [
        {
          property: 'name',
          constraints: {
            isNotEmpty: 'name should not be empty',
          },
        },
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});
