import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { Tenant } from '../../src/domain/tenant/entities/tenant.entity';
import { findOneQuery, findAllQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';

describe('Tenant Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Tenants');
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should find a tenant with admin role', async () => {
    const tenantInput = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'tenant@tenant.com',
      phone: '1231231232',
    };
    const documentInput = {
      ownerId: 1,
      ownerRole: ERole.Tenant,
      type: EDocumentType.Cpf,
    };

    await Tenant.create(tenantInput);
    await Document.create(documentInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.data).toEqual({
      tenant: {
        id: 1,
        ...tenantInput,
        documents: [{ id: 1, type: documentInput.type }],
      },
    });
  });

  it('should find a tenant with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const tenantInput = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'tenant@tenant.com',
      phone: '1231231232',
    };
    const documentInput = {
      ownerId: 1,
      ownerRole: ERole.Tenant,
      type: EDocumentType.Cpf,
    };

    await Tenant.create(tenantInput);
    await Document.create(documentInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.data).toEqual({
      tenant: {
        id: 1,
        ...tenantInput,
        documents: [{ id: 1, type: documentInput.type }],
      },
    });
  });

  it('should not find a tenant with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });

  it('should find all tenants with admin role', async () => {
    const tenantInput = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'tenant@tenant.com',
      phone: '1231231232',
    };
    await Tenant.create(tenantInput);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toEqual({ tenants: [{ id: 1, ...tenantInput }] });
  });

  it('should not find all tenants with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    token = generateToken({ sub: 1, role: 'tenant' });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });
});
