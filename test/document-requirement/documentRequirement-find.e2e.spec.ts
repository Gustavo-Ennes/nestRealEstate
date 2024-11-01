import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { findAllQuery, findOneQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { ELegalType } from '../../src/domain/enum/legal-type.enum';
import { CreateDocumentRequirementInput } from '../../src/domain/document-requirement/dto/create-document-requirement.input';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { DocumentRequirement } from '../../src/domain/document-requirement/entities/document-requirement.entity';

describe('DocumentRequirement Module - Find (e2e)', () => {
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

  it('should list all document requirements with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirements');
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentType',
      { id: documentType.id, name: documentType.name },
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirements[0]).toHaveProperty('updatedAt');
  });

  it('should list all document requirements with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirements');
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentType',
      { id: documentType.id, name: documentType.name },
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirements[0]).toHaveProperty('updatedAt');
  });

  it('should list all document requirement with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirements');
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentType',
      { id: documentType.id, name: documentType.name },
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirements[0]).toHaveProperty('updatedAt');
  });

  it('should list all document requirement with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirements');
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty(
      'documentType',
      { id: documentType.id, name: documentType.name },
    );
    expect(res.body.data.documentRequirements[0]).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirements[0]).toHaveProperty('updatedAt');
  });

  it('should find one document requirement with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
        variables: { id: documentRequirement.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirement');
    expect(res.body.data.documentRequirement).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirement).toHaveProperty('documentType', {
      id: documentType.id,
      name: documentType.name,
    });
    expect(res.body.data.documentRequirement).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirement).toHaveProperty('updatedAt');
  });

  it('should find one document requirement with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findOneQuery,
        variables: { id: documentRequirement.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirement');
    expect(res.body.data.documentRequirement).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirement).toHaveProperty('documentType', {
      id: documentType.id,
      name: documentType.name,
    });
    expect(res.body.data.documentRequirement).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirement).toHaveProperty('updatedAt');
  });

  it('should find one document requirement with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: findOneQuery,
        variables: { id: documentRequirement.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirement');
    expect(res.body.data.documentRequirement).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirement).toHaveProperty('documentType', {
      id: documentType.id,
      name: documentType.name,
    });
    expect(res.body.data.documentRequirement).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirement).toHaveProperty('updatedAt');
  });

  it('should find one document requirement with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findOneQuery,
        variables: { id: documentRequirement.id },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('documentRequirement');
    expect(res.body.data.documentRequirement).toHaveProperty(
      'role',
      input.role,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'documentTypeId',
      input.documentTypeId,
    );
    expect(res.body.data.documentRequirement).toHaveProperty(
      'isRequired',
      true,
    );
    expect(res.body.data.documentRequirement).toHaveProperty('documentType', {
      id: documentType.id,
      name: documentType.name,
    });
    expect(res.body.data.documentRequirement).toHaveProperty('createdAt');
    expect(res.body.data.documentRequirement).toHaveProperty('updatedAt');
  });
});
