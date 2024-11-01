import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { createMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { ERole } from '../../src/application/auth/role/role.enum';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';
import { CreateDocumentTypeInput } from 'src/domain/document-type/dto/create-document-type.input';

describe('DocumentType Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  const input: CreateDocumentTypeInput = {
    name: EDocumentType.LastBalanceSheet,
    legalType: ELegalType.Legal,
  };

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('DocumentTypes');
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should create a document type with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('createDocumentType');
    expect(res.body.data.createDocumentType).toHaveProperty('name', input.name);
    expect(res.body.data.createDocumentType).toHaveProperty(
      'legalType',
      input.legalType,
    );
    expect(res.body.data.createDocumentType).toHaveProperty('createdAt');
    expect(res.body.data.createDocumentType).toHaveProperty('updatedAt');
  });

  it('should create a document type with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('createDocumentType');
    expect(res.body.data.createDocumentType).toHaveProperty('name', input.name);
    expect(res.body.data.createDocumentType).toHaveProperty(
      'legalType',
      input.legalType,
    );
    expect(res.body.data.createDocumentType).toHaveProperty('createdAt');
    expect(res.body.data.createDocumentType).toHaveProperty('updatedAt');
  });

  it('should not create a document type with a tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: createMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not create a document type with a landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: createMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('message', 'Forbidden resource');
  });

  it('should not create a document type without a name', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: { legalType: ELegalType.Legal } },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { legalType: "legal" }; Field "name" of required type "String!" was not provided.',
    );
    expect(res.body.errors[0]).toHaveProperty('extensions', {
      code: 'BAD_USER_INPUT',
    });
  });

  it('should not create a document type with an empty name', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: { name: '', legalType: ELegalType.Legal } },
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

  it('should not create a document type without an actor type', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: { name: ELegalType.Legal } },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { name: "legal" }; Field "legalType" of required type "String!" was not provided.',
    );
    expect(res.body.errors[0]).toHaveProperty('extensions', {
      code: 'BAD_USER_INPUT',
    });
  });

  it('should not create a document type with an invalid actor type', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: {
          input: {
            name: EDocumentType.ProofOrCompanyProperties,
            legalType: 'musician',
          },
        },
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
            isActorType: "musician isn't a valid actor type.",
          },
        },
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});
