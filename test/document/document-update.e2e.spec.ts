import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { updateMutation } from './queries';
import { generateToken, initApp, requestAndCheckError } from '../utils';
import { Tenant } from '../../src/domain/tenant/entities/tenant.entity';
import { Document } from '../../src/domain/document/entities/document.entity';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { ERole } from '../../src/application/auth/role/role.enum';
import { DocumentType } from '../../src/domain/document-type/entities/document-type.entity';

describe('Document Module - Update (e2e)', () => {
  let app: INestApplication,
    sequelize: Sequelize,
    token: string,
    document: Document,
    naturalTenant: Tenant;

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('Documents');
    await sequelize.sync({ force: true });

    naturalTenant = await Tenant.create({
      name: 'Gustavo',
      cpf: '12312312322',
      email: 'gustavo@ennes.dev',
      phone: '3232146548',
    });

    document = await Document.create({
      type: EDocumentType.CNPJ,
      ownerRole: ERole.Tenant,
      ownerId: naturalTenant.id,
      url: 'some.url.com',
    });

    await DocumentType.create({
      name: EDocumentType.CNPJ,
      legalType: 'legal',
    });
    await DocumentType.create({
      name: EDocumentType.Cpf,
      legalType: 'natural',
    });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update a document with admin role', async () => {
    const updateDto = {
      id: document.id,
      type: EDocumentType.Cpf,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await document.reload();
    expect(res.body.data).toHaveProperty('updateDocument');
    expect(res.body.data.updateDocument).toHaveProperty('type', document.type);
    expect(res.body.data.updateDocument).toHaveProperty(
      'ownerRole',
      document.ownerRole,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'ownerId',
      document.ownerId,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'status',
      document.status,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'observation',
      document.observation,
    );
    expect(res.body.data.updateDocument).toHaveProperty('createdAt');
    expect(res.body.data.updateDocument).toHaveProperty('updatedAt');
    expect(document.type).toBe(EDocumentType.Cpf);
  });

  it('should update a document with tenant role', async () => {
    token = generateToken({ sub: naturalTenant.id, role: ERole.Tenant });
    const updateDto = {
      id: document.id,
      type: EDocumentType.Cpf,
      ownerRole: ERole.Tenant,
      ownerId: 1,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await document.reload();
    expect(res.body.data).toHaveProperty('updateDocument');
    expect(res.body.data.updateDocument).toHaveProperty('type', document.type);
    expect(res.body.data.updateDocument).toHaveProperty(
      'ownerRole',
      document.ownerRole,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'ownerId',
      document.ownerId,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'status',
      document.status,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'observation',
      document.observation,
    );
    expect(res.body.data.updateDocument).toHaveProperty('createdAt');
    expect(res.body.data.updateDocument).toHaveProperty('updatedAt');
    expect(document.type).toBe(EDocumentType.Cpf);
  });

  it('should update a document with landlord role', async () => {
    token = generateToken({ sub: naturalTenant.id, role: ERole.Landlord });
    const updateDto = {
      id: document.id,
      type: EDocumentType.Cpf,
      observation: 'Some observation',
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await document.reload();

    expect(res.body.data).toHaveProperty('updateDocument');
    expect(res.body.data.updateDocument).toHaveProperty('type', document.type);
    expect(res.body.data.updateDocument).toHaveProperty(
      'ownerRole',
      document.ownerRole,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'ownerId',
      document.ownerId,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'status',
      document.status,
    );
    expect(res.body.data.updateDocument).toHaveProperty(
      'observation',
      document.observation,
    );
    expect(res.body.data.updateDocument).toHaveProperty('createdAt');
    expect(res.body.data.updateDocument).toHaveProperty('updatedAt');
    expect(document.type).toBe(EDocumentType.Cpf);
  });

  it('should not update if document type is invalid', async () =>
    await requestAndCheckError('updateDocument')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: document.id, type: 'chessGameRecord' } },
      property: 'type',
      constraints: {
        isValidDocumentType: 'Inexistent document type: chessGameRecord',
      },
    }));

  it('should not update a document if owner not exists', async () => {
    const updateDto = {
      id: document.id,
      ownerId: 222,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'No tenant found with provided id.',
    );
  });

  it('should not update if document owner type is invalid', async () =>
    await requestAndCheckError('updateDocument')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: document.id, ownerRole: 'chessPlayer' } },
      property: 'ownerRole',
      constraints: {
        isValidDocumentOwnerRole: 'Inexistent document owner role: chessPlayer',
      },
    }));
});
