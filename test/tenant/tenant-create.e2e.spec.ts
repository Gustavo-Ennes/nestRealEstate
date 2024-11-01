import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { createMutation } from './queries';
import { tenantWith } from './utils';
import {
  requestAndCheckError,
  initApp,
  afterAllTests,
  generateToken,
} from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';

describe('Tenant Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeAll(async () => {
    const { application, adminToken, db } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Tenants');
    await sequelize.sync({ force: true });
  });

  afterAll(async () => await afterAllTests(app));

  it('should create a tenant with admin role', async () => {
    const tenantInput = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'tenant@tenant.com',
      phone: '12312312322',
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: tenantInput },
      })
      .expect(200);

    expect(res.body.data).toEqual({ createTenant: { id: 1, ...tenantInput } });
  });

  it('should create a tenant with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const tenantInput = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'tenant@tenant.com',
      phone: '12312312322',
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: tenantInput },
      })
      .expect(200);

    expect(res.body.data).toEqual({ createTenant: { id: 1, ...tenantInput } });
  });

  it('should not create a tenant without cpf or cnpj', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.empty.cpjAndCnpj },
      property: 'cpf',
      constraints: {
        containsCpfOrCnpj: 'cpf or cnpj must contain a valid value',
      },
    }));

  it('should not create a tenant wit wrong cpf length', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.wrong.cpfLength },
      property: 'cpf',
      constraints: {
        cpfLengthValidator: 'cpf should have 11 digits',
      },
    }));

  it('should not create a tenant wit wrong cnpj length', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.wrong.cnpjLength },
      property: 'cnpj',
      constraints: {
        cnpjLengthValidator: 'cnpj should have 14 digits',
      },
    }));

  it('should not create a tenant with letters and special characters in cpf', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.lettersAndSpecialChars.inCpf },
      property: 'cpf',
      constraints: {
        hasOnlyDigits: 'cpf should have only digits.',
      },
    }));

  it('should not create a tenant with letters and special characters in cnpj', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.lettersAndSpecialChars.inCnpj },
      property: 'cnpj',
      constraints: {
        hasOnlyDigits: 'cnpj should have only digits.',
      },
    }));

  it('should not create a tenant with empty email', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.empty.email },
      property: 'email',
      constraints: {
        isNotEmpty: 'email should not be empty',
        isEmail: 'email is invalid.',
      },
    }));

  it('should not create a tenant with invalid email pattern', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.invalid.emailPattern },
      property: 'email',
      constraints: {
        isEmail: 'email is invalid.',
      },
    }));

  it('should not create a tenant with empty phone', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.empty.phone },
      property: 'phone',
      constraints: {
        isNotEmpty: 'phone should not be empty',
      },
    }));

  it('should not create a tenant with wrong phone length', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.wrong.phoneLength },
      property: 'phone',
      constraints: {
        phoneLengthValidator: 'phone should have 10 or 11 digits',
      },
    }));

  it('should not create a tenant with letters or special characters in phone', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.lettersAndSpecialChars.inPhone },
      property: 'phone',
      constraints: {
        hasOnlyDigits: 'phone should have only digits.',
      },
    }));

  it('should not create a tenant with empty name', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.empty.name },
      property: 'name',
      constraints: {
        isNotEmpty: 'name should not be empty',
      },
    }));

  it('should not create a tenant with numbers and special characters in name', async () =>
    await requestAndCheckError('createTenant')({
      app,
      token,
      query: createMutation,
      variables: { input: tenantWith.numbersAndSpecialChars.inName },
      property: 'name',
      constraints: {
        hasOnlyLetters: 'name should have only letters.',
      },
    }));
});
