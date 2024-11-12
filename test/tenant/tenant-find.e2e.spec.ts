import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { Tenant } from '../../src/domain/tenant/entities/tenant.entity';
import { findOneQuery, findAllQuery } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { EDocumentType } from '../../src/domain/document/enum/document-type.enum';
import { Document } from '../../src/domain/document/entities/document.entity';
import { Client } from '../../src/application/client/entities/client.entity';
import { clientInput } from '../client/utils';
import { tenantInput } from './utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { addressInput } from '../address/utils';

describe('Tenant Module - Find (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  const documentInput = {
    ownerId: 1,
    ownerRole: ERole.Tenant,
    type: EDocumentType.Cpf,
  };

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Tenants');
    await sequelize.sync({ force: true });

    await Address.create(addressInput);
    await Client.create(clientInput);
    await Tenant.create(tenantInput);
    await Document.create(documentInput);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should find a tenant with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('tenant');
    expect(res.body.data.tenant).toEqual(
      expect.objectContaining({
        id: 1,
        ...tenantInput,
        documents: [{ id: 1, type: documentInput.type }],
        client: { id: 1 },
        address: { id: 1 },
      }),
    );
    expect(res.body.data.tenant).toHaveProperty('createdAt');
    expect(res.body.data.tenant).toHaveProperty('updatedAt');
  });

  it('should find a tenant with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: findOneQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('tenant');
    expect(res.body.data.tenant).toEqual(
      expect.objectContaining({
        id: 1,
        ...tenantInput,
        documents: [{ id: 1, type: documentInput.type }],
        client: { id: 1 },
        address: { id: 1 },
      }),
    );
    expect(res.body.data.tenant).toHaveProperty('createdAt');
    expect(res.body.data.tenant).toHaveProperty('updatedAt');
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
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: findAllQuery,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('tenants');
    expect(res.body.data.tenants[0]).toEqual(
      expect.objectContaining({
        id: 1,
        ...tenantInput,
        client: { id: 1 },
        address: { id: 1 },
      }),
    );
    expect(res.body.data.tenants[0]).toHaveProperty('createdAt');
    expect(res.body.data.tenants[0]).toHaveProperty('updatedAt');
  });

  it('should not find all tenants with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });

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
