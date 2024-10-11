import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { createMutation } from './queries';
import { generateToken, initApp } from '../utils';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { ERole } from '../../src/application/auth/role/role.enum';
import { EActorType } from '../../src/domain/enum/actor-type.enum';
import { CreateDocumentTypeInput } from 'src/domain/document-type/dto/create-document-type.input';

describe('DocumentType Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  const input: CreateDocumentTypeInput = {
    name: EDocumentType.LastBalanceSheet,
    applicableTo: EActorType.Legal,
  };

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('DocumentTypes');
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
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
      'applicableTo',
      input.applicableTo,
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
        variables: { input: { applicableTo: EActorType.Legal } },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { applicableTo: "legal" }; Field "name" of required type "String!" was not provided.',
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
        variables: { input: { name: '', applicableTo: EActorType.Legal } },
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
        variables: { input: { name: EActorType.Legal } },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { name: "legal" }; Field "applicableTo" of required type "String!" was not provided.',
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
            applicableTo: 'musician',
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
          property: 'applicableTo',
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
