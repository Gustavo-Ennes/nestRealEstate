import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { createMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';
import { CreateDocumentRequirementInput } from '../../src/domain/document-requirement/dto/create-document-requirement.input';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { assoc, dissoc } from 'ramda';

describe('DocumentRequirement Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let documentType: DocumentType;
  const input: CreateDocumentRequirementInput = {
    role: ERole.Landlord,
    documentTypeId: 1,
  };

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('DocumentRequirements');
    await sequelize.sync({ force: true });

    documentType = await DocumentType.create({
      name: EDocumentType.CNPJ,
      legalType: ELegalType.Legal,
    });
    input.documentTypeId = documentType.id;
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should create a document requirement with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('createDocumentRequirement');
    expect(res.body.data.createDocumentRequirement).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.createDocumentRequirement).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.createDocumentRequirement).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.createDocumentRequirement).toHaveProperty(
      'documentType',
      { id: documentType.id, name: documentType.name },
    );
    expect(res.body.data.createDocumentRequirement).toHaveProperty('createdAt');
    expect(res.body.data.createDocumentRequirement).toHaveProperty('updatedAt');
  });

  it('should not create a document requirement with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: createMutation,
        variables: { input },
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

  it('should not create a document requirement with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: createMutation,
        variables: { input },
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
  it('should not create a document without a role', async () => {
    const noRoleInput = dissoc('role', input);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: noRoleInput },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'BAD_USER_INPUT',
    );
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { documentTypeId: 1 }; Field "role" of required type "String!" was not provided.',
    );
  });

  it('should not create a document with an empty role', async () => {
    const emptyRoleInput = assoc('role', '', input);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: emptyRoleInput },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'role',
          constraints: {
            isNotEmpty: 'role should not be empty',
            isValidDocumentOwnerRole: 'Inexistent document owner role: ',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create a document with an invalid role', async () => {
    const invalidRoleInput = assoc('role', 'musician', input);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: invalidRoleInput },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'role',
          constraints: {
            isValidDocumentOwnerRole:
              'Inexistent document owner role: musician',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create a document without documentTypeId property', async () => {
    const noDocumentTypeIdInput = dissoc('documentTypeId', input);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: noDocumentTypeIdInput },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'BAD_USER_INPUT',
    );
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { role: "landlord" }; Field "documentTypeId" of required type "Int!" was not provided.',
    );
  });

  it('should not create a document if document type does not exists', async () => {
    const inputWithoutReferencedDocumentType = assoc(
      'documentTypeId',
      666,
      input,
    );
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutReferencedDocumentType },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'INTERNAL_SERVER_ERROR',
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      'Document type not found with provided documentTypeId',
    );
  });
});
