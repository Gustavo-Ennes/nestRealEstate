import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { updateMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';
import { CreateDocumentRequirementInput } from '../../src/domain/document-requirement/dto/create-document-requirement.input';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { DocumentRequirement } from '../../src/domain/document-requirement/entities/document-requirement.entity';
import { UpdateDocumentRequirementInput } from '../../src/domain/document-requirement/dto/update-document-requirement.input';

describe('DocumentRequirement Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let documentType: DocumentType;
  const input: CreateDocumentRequirementInput = {
    role: ERole.Landlord,
    documentTypeId: 1,
  };
  const updatePayload: UpdateDocumentRequirementInput = {
    id: 1,
    role: ERole.Tenant,
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
    await DocumentRequirement.create(input);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should update a document requirement with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('updateDocumentRequirement');
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'role',
      updatePayload.role,
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'documentType',
      { id: documentType.id, name: documentType.name },
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty('createdAt');
    expect(res.body.data.updateDocumentRequirement).toHaveProperty('updatedAt');
  });

  it('should update a document requirement with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('updateDocumentRequirement');
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'role',
      updatePayload.role,
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty(
      'documentType',
      { id: documentType.id, name: documentType.name },
    );
    expect(res.body.data.updateDocumentRequirement).toHaveProperty('createdAt');
    expect(res.body.data.updateDocumentRequirement).toHaveProperty('updatedAt');
  });

  it('should not update a document requirement with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
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

  it('should not update a document requirement with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
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

  it('should not update a document with an empty role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: { id: 1, role: '' } },
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

  it('should not update a document with an invalid role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: { id: 1, role: 'musician' } },
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

  it('should throw if document requirement to update does not exists', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: { id: 1, documentTypeId: 666 } },
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

  it('should not update a document if document type does not exists', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: { id: 1, documentTypeId: 666 } },
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
