import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { updateMutation } from './queries';
import { generateToken, initApp, requestAndCheckError } from '../utils';
import { Tenant } from '../../src/tenant/entities/tenant.entity';
import { Document } from '../../src/document/entities/document.entity';
import { EDocumentType } from '../../src/document/enum/document-type.enum';
import { EOwnerType } from '../../src/document/enum/owner-type.enum';
import { Role } from '../../src/auth/role/role.enum';
import { isValidDocumentType } from 'src/document/validations/type.validation';

describe('Tenant Module - Update (e2e)', () => {
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

    await sequelize.getQueryInterface().dropTable('Tenants');
    await sequelize.sync({ force: true });

    naturalTenant = await Tenant.create({
      name: 'Gustavo',
      cpf: '12312312322',
      email: 'gustavo@ennes.dev',
      phone: '3232146548',
    });

    document = await Document.create({
      type: EDocumentType.CNPJ,
      ownerType: EOwnerType.Tenant,
      ownerId: naturalTenant.id,
      url: 'some.url.com',
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
      'ownerType',
      document.ownerType,
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
    token = generateToken({ sub: naturalTenant.id, role: Role.Tenant });
    const updateDto = {
      id: document.id,
      type: EDocumentType.Certificate,
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
      'ownerType',
      document.ownerType,
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
    expect(document.type).toBe(EDocumentType.Certificate);
  });

  it('should update a document with landlord role', async () => {
    token = generateToken({ sub: naturalTenant.id, role: Role.Landlord });
    const updateDto = {
      id: document.id,
      type: EDocumentType.ProofOfResidence,
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
      'ownerType',
      document.ownerType,
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
    expect(document.type).toBe(EDocumentType.ProofOfResidence);
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

  it('should not update if document owner type is invalid', async () =>
    await requestAndCheckError('updateDocument')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: document.id, ownerType: 'chessPlayer' } },
      property: 'ownerType',
      constraints: {
        isValidDocumentOwnerType: 'Inexistent document owner type: chessPlayer',
      },
    }));
});
