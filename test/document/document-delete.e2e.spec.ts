import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { afterAllTests, initApp, requestAndCheckError } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';

describe('Document Module - Delete (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let document: Document;

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Documents');
    await sequelize.sync({ force: true });

    document = await Document.create({
      type: EDocumentType.CNPJ,
      ownerRole: ERole.Tenant,
      ownerId: 1,
      url: 'some.url.com',
    });
  });

  afterAll(async () => {
    await afterAllTests(app);
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
