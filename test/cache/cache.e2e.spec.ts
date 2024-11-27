import { INestApplication } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import {
  createMutation as createTenantMutation,
  updateMutation as updateTenantMutation,
  deleteMutation as deleteTenantMutation,
} from '../tenant/queries';
import { initApp } from '../utils';
import { tenantInput } from '../tenant/utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { Client } from '../../src/application/client/entities/client.entity';
import { addressInput } from '../address/utils';
import { clientInput } from '../client/utils';
import { TenantService } from '../../src/domain/tenant/tenant.service';
import { UpdateTenantInput } from '../../src/domain/tenant/dto/update-tenant.input';
import { CacheService } from '../../src/application/cache/cache.service';
import { Tenant } from '../../src/domain/tenant/entities/tenant.entity';
import { ModuleNames } from '../../src/application/cache/cache.utils';

describe('Cache module - All (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let cache: Cache;
  let tenantAddress: Address;
  let tenantService: TenantService;
  let cacheService: CacheService;

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    sequelize = db;
    token = adminToken;
    cache = app.get<Cache>(CACHE_MANAGER);
    tenantService = app.get<TenantService>(TenantService);
    cacheService = app.get<CacheService>(CacheService);
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });

    // address to client
    await Address.create(addressInput);
    await Client.create(clientInput);
    // address to tenant
    tenantAddress = await Address.create(addressInput);
    tenantInput.addressId = tenantAddress.id;

    await cache.reset();
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
    await cache.reset();
  });

  it('should insert an entity into cache', async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createTenantMutation,
        variables: { input: tenantInput },
      })
      .expect(200);

    const individualFromCache = await cache.get(`tenant:1`);
    const allFromCache = await cache.get('tenants');

    expect(individualFromCache).toHaveProperty('id', 1);
    expect(individualFromCache).toHaveProperty('name', tenantInput.name);
    expect(allFromCache).toHaveLength(1);
    expect(allFromCache[0]).toHaveProperty('id', 1);
    expect(allFromCache[0]).toHaveProperty('name', tenantInput.name);
  });

  it('should update an entity in the the cache', async () => {
    const tenant = await tenantService.create(tenantInput);
    const updatePayload: UpdateTenantInput = {
      id: 1,
      name: 'new name',
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateTenantMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    const individualFromCache = await cache.get(`tenant:1`);
    const allFromCache = await cache.get('tenants');

    expect(individualFromCache).toHaveProperty('id', tenant.id);
    expect(individualFromCache).toHaveProperty('name', updatePayload.name);
    expect(allFromCache).toHaveLength(1);
    expect(allFromCache[0]).toHaveProperty('id', 1);
    expect(allFromCache[0]).toHaveProperty('name', updatePayload.name);
  });

  it('should get an entity from the cache', async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createTenantMutation,
        variables: { input: tenantInput },
      })
      .expect(200);

    const tenantFromCache = await cacheService.getFromCache(
      ModuleNames.Tenant,
      1,
    );

    expect(tenantFromCache).toHaveProperty('id', 1);
    expect(tenantFromCache).toHaveProperty('name', tenantInput.name);
  });

  it('should get all entities from the cache', async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createTenantMutation,
        variables: { input: tenantInput },
      })
      .expect(200);

    const tenantsFromCache = await cacheService.getFromCache<Tenant>(
      ModuleNames.Tenant,
    );

    expect(tenantsFromCache).toHaveLength(1);
    expect(tenantsFromCache[0]).toHaveProperty('id', 1);
    expect(tenantsFromCache[0]).toHaveProperty('name', tenantInput.name);
  });

  it('should remove one entity from cache', async () => {
    const tenant = await tenantService.create(tenantInput);
    await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteTenantMutation,
        variables: { input: tenant.id },
      })
      .expect(200);

    const tenantFromCache = await cache.get(`tenant:${tenant.id}`);
    const allTenants = await cache.get('tenants');

    expect(tenantFromCache).toBeUndefined();
    expect(allTenants).toHaveLength(0);
  });
});
