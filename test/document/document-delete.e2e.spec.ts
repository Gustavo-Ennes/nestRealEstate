import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { initApp, requestAndCheckError } from '../utils';
import { EOwnerType } from '../../src/domain/document/enum/owner-type.enum';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';

describe('Document Module - Delete (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let document: Document;

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('Documents');
    await sequelize.sync({ force: true });

    document = await Document.create({
      type: EDocumentType.CNPJ,
      ownerType: EOwnerType.Tenant,
      ownerId: 1,
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

  it('should delete a tenant with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: document.id },
      })
      .expect(200);

    expect(res.body.data.removeDocument).toEqual(true);
  });

  it('should throw an error if tenant not found', async () => {
    await document.destroy();

    await requestAndCheckError('removeDocument')({
      app,
      token,
      query: deleteMutation,
      variables: { input: document.id },
      property: 'type',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});
