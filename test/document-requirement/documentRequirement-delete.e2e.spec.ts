import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';
import { CreateDocumentRequirementInput } from '../../src/domain/document-requirement/dto/create-document-requirement.input';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { DocumentRequirement } from '../../src/domain/document-requirement/entities/document-requirement.entity';

describe('DocumentRequirement Module - Delete (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let documentType: DocumentType;
  let documentRequirement: DocumentRequirement;
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
    documentRequirement = await DocumentRequirement.create(input);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should remove a document requirement with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { id: documentRequirement.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('removeDocumentRequirement');
    expect(res.body.data.removeDocumentRequirement).toBeTruthy();
  });

  it('should not remove a document requirement with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: deleteMutation,
        variables: { id: documentRequirement.id },
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

  it('should not remove a document requirement with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: deleteMutation,
        variables: { id: documentRequirement.id },
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

  it('should throw if no document requirement was found to remove', async () => {
    await documentRequirement.destroy();

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { id: documentRequirement.id },
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
      'No document requirement found with provided id.',
    );
  });
});
