import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { updateMutation } from './queries';
import {
  afterAllTests,
  generateToken,
  initApp,
  requestAndCheckError,
} from '../utils';
import { Tenant } from '../../src/domain/tenant/entities/tenant.entity';
import { ERole } from '../../src/application/auth/role/role.enum';
import { CreateClientInput } from '../../src/application/client/dto/create-client.input';
import { CreateTenantInput } from '../../src/domain/tenant/dto/create-tenant.input';
import { Client } from '../../src/application/client/entities/client.entity';

describe('Tenant Module - Update (e2e)', () => {
  let app: INestApplication,
    sequelize: Sequelize,
    token: string,
    naturalTenant: Tenant,
    legalTenant: Tenant;
  const clientInput: CreateClientInput = {
    cnpj: '12312312312322',
    email: 'client@mail.com',
    isActive: true,
    name: 'Joseph Climber',
    phone: '12312312322',
  };
  const naturalTenantInput: CreateTenantInput = {
    name: 'tenant',
    email: 'ads@dasd.com',
    phone: '12312312322',
    cpf: '12312312322',
    cnpj: null,
    clientId: 1,
  };
  const legalTenantInput: CreateTenantInput = {
    name: 'tenant',
    email: 'ads@dasd.com',
    phone: '12312312322',
    cnpj: '12312312312322',
    cpf: null,
    clientId: 1,
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

    await Client.create(clientInput);
    naturalTenant = await Tenant.create(naturalTenantInput);
    legalTenant = await Tenant.create(legalTenantInput);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should update a tenant with admin role', async () => {
    const updateDto = {
      id: naturalTenant.id,
      name: 'new name',
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await naturalTenant.reload();

    expect(res.body.data).toHaveProperty('updateTenant');
    expect(res.body.data.updateTenant).toHaveProperty('id', naturalTenant.id);
    expect(res.body.data.updateTenant).toHaveProperty(
      'name',
      naturalTenant.name,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'phone',
      naturalTenant.phone,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'email',
      naturalTenant.email,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'clientId',
      naturalTenant.clientId,
    );
    expect(res.body.data.updateTenant).toHaveProperty('client', { id: 1 });
    expect(naturalTenant.name).toBe('new name');
  });

  it('should update a tenant with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const updateDto = {
      id: naturalTenant.id,
      name: 'new name',
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await naturalTenant.reload();

    expect(res.body.data).toHaveProperty('updateTenant');
    expect(res.body.data.updateTenant).toHaveProperty('id', naturalTenant.id);
    expect(res.body.data.updateTenant).toHaveProperty(
      'name',
      naturalTenant.name,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'phone',
      naturalTenant.phone,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'email',
      naturalTenant.email,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'clientId',
      naturalTenant.clientId,
    );
    expect(res.body.data.updateTenant).toHaveProperty('client', { id: 1 });
    expect(naturalTenant.name).toBe('new name');
  });

  it('should update a tenant with tenant role', async () => {
    const updateDto = {
      id: naturalTenant.id,
      name: 'new name',
    };
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await naturalTenant.reload();

    expect(res.body.data).toHaveProperty('updateTenant');
    expect(res.body.data.updateTenant).toHaveProperty('id', naturalTenant.id);
    expect(res.body.data.updateTenant).toHaveProperty(
      'name',
      naturalTenant.name,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'phone',
      naturalTenant.phone,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'email',
      naturalTenant.email,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'clientId',
      naturalTenant.clientId,
    );
    expect(res.body.data.updateTenant).toHaveProperty('client', { id: 1 });
    expect(naturalTenant.name).toBe('new name');
  });

  it('should not update a tenant with landlord role', async () => {
    const updateDto = {
      id: naturalTenant.id,
      name: 'new name',
    };
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });

  it('should not update a tenant client if it does not exists', async () => {
    const updateDto = {
      id: naturalTenant.id,
      clientId: 2,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Client not found with provided id.',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('should not update a legal tenant cpf(just cnpj)', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: naturalTenant.id, cnpj: '12312312312322' } },
      property: 'cnpj',
      code: 'INTERNAL_SERVER_ERROR',
    }));

  it('should not update a natural tenant cnpj(just cpf)', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, cpf: '12312312322' } },
      property: 'cpf',
      code: 'INTERNAL_SERVER_ERROR',
    }));

  it('should not update a natural tenant with wrong cpf length', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: naturalTenant.id, cpf: '12312' } },
      property: 'cpf',
      constraints: { cpfLengthValidator: 'cpf should have 11 digits' },
    }));

  it('should not update a legal tenant with wrong cnpj length', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, cnpj: '12312' } },
      property: 'cnpj',
      constraints: { cnpjLengthValidator: 'cnpj should have 14 digits' },
    }));

  it('should not update a legal tenant with letters or special characters in cpnj', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, cnpj: '123asd123asd@@' } },
      property: 'cnpj',
      constraints: { hasOnlyDigits: 'cnpj should have only digits.' },
    }));

  it('should not update a natural tenant with letters or special characters in cpf', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, cpf: '123asd123@@' } },
      property: 'cpf',
      constraints: { hasOnlyDigits: 'cpf should have only digits.' },
    }));

  it('should not update a tenant with digits or special characters in name', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, name: '123asd123@@' } },
      property: 'name',
      constraints: { hasOnlyLetters: 'name should have only letters.' },
    }));

  it('should not update a tenant with an empty name', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, name: '' } },
      property: 'name',
      constraints: { isNotEmpty: 'name should not be empty' },
    }));

  it('should not update a tenant with letters or special characters in phone', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, phone: '123asd123!' } },
      property: 'phone',
      constraints: { hasOnlyDigits: 'phone should have only digits.' },
    }));

  it('should not update a tenant with empty phone', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, phone: '' } },
      property: 'phone',
      constraints: { isNotEmpty: 'phone should not be empty' },
    }));

  it('should not update a tenant with empty email', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, email: '' } },
      property: 'email',
      constraints: {
        isNotEmpty: 'email should not be empty',
        isEmail: 'email is invalid.',
      },
    }));

  it('should not update a tenant with invalid email', async () =>
    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalTenant.id, email: '123@.com.dev@' } },
      property: 'email',
      constraints: {
        isEmail: 'email is invalid.',
      },
    }));

  it('should not update a inactive tenant', async () => {
    naturalTenant.isActive = false;
    await naturalTenant.save();

    await requestAndCheckError('updateTenant')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: naturalTenant.id, name: 'new name' } },
      property: 'name',
      constraints: {
        isEmail: 'email is invalid.',
      },
      code: 'INTERNAL_SERVER_ERROR',
    });

    naturalTenant.isActive = true;
    await naturalTenant.save();
  });

  it('should activate a deactivate tenant first before update something else', async () => {
    const updateDto = {
      id: naturalTenant.id,
      isActive: true,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await naturalTenant.reload();

    expect(res.body.data).toHaveProperty('updateTenant');
    expect(res.body.data.updateTenant).toHaveProperty('id', naturalTenant.id);
    expect(res.body.data.updateTenant).toHaveProperty(
      'name',
      naturalTenant.name,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'phone',
      naturalTenant.phone,
    );
    expect(res.body.data.updateTenant).toHaveProperty(
      'email',
      naturalTenant.email,
    );
    expect(naturalTenant.isActive).toBeTruthy();
  });
});
