import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { assoc } from 'ramda';
import { createMutation } from './queries';
import { landlordInput, landlordWith } from './utils';
import {
  requestAndCheckError,
  initApp,
  afterAllTests,
  generateToken,
} from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { Client } from '../../src/application/client/entities/client.entity';
import { clientInput } from '../client/utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { addressInput } from '../address/utils';
import { tenantInput } from '../tenant/utils';
import { Tenant } from '../../src/domain/tenant/entities/tenant.entity';

describe('Landlord Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let address: Address;
  let client: Client;

  beforeAll(async () => {
    const { application, adminToken, db } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });

    // client's address
    await Address.create(addressInput);
    client = await Client.create(clientInput);

    // landlord's address
    address = await Address.create(addressInput);
    landlordInput.addressId = address.id;
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should create a landlord with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: landlordInput },
      })
      .expect(200);
    console.log('🚀 ~ it ~ res:', JSON.stringify(res.body, null, 2));

    expect(res.body.data).toHaveProperty('createLandlord');
    expect(res.body.data.createLandlord).toHaveProperty('id', 1);
    expect(res.body.data.createLandlord).toHaveProperty(
      'name',
      landlordInput.name,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'phone',
      landlordInput.phone,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'email',
      landlordInput.email,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'clientId',
      landlordInput.clientId,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'addressId',
      landlordInput.addressId,
    );
    expect(res.body.data.createLandlord).toHaveProperty('client', {
      id: client.id,
    });
    expect(res.body.data.createLandlord).toHaveProperty('address', {
      id: address.id,
    });
    expect(res.body.data.createLandlord).toHaveProperty('createdAt');
    expect(res.body.data.createLandlord).toHaveProperty('updatedAt');
  });

  it('should create a landlord with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: landlordInput },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('createLandlord');
    expect(res.body.data.createLandlord).toHaveProperty('id', 1);
    expect(res.body.data.createLandlord).toHaveProperty(
      'name',
      landlordInput.name,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'phone',
      landlordInput.phone,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'email',
      landlordInput.email,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'clientId',
      landlordInput.clientId,
    );
    expect(res.body.data.createLandlord).toHaveProperty(
      'addressId',
      landlordInput.addressId,
    );
    expect(res.body.data.createLandlord).toHaveProperty('client', {
      id: client.id,
    });
    expect(res.body.data.createLandlord).toHaveProperty('address', {
      id: address.id,
    });
    expect(res.body.data.createLandlord).toHaveProperty('createdAt');
    expect(res.body.data.createLandlord).toHaveProperty('updatedAt');
  });

  it('should not create a landlord if address does not exists', async () => {
    await address.destroy();

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: landlordInput },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'INTERNAL_SERVER_ERROR',
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      'No address found with provided addressId.',
    );
  });

  it('should not create a landlord if address is already associated to another entity', async () => {
    const tenantUsingAddress = assoc('addressId', address.id, tenantInput);
    await Client.create(clientInput);
    await Tenant.create(tenantUsingAddress);

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: landlordInput },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      'Address already associated to another entity.',
    );
  });

  it('should not create a landlord without a clientId', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: landlordWith.empty.clientId },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { name: "landlord", cpf: "12312312322", email: "landlord@landlord.com", phone: "12312312322", addressId: 1, cnpj: null }; Field "clientId" of required type "Int!" was not provided.',
    );
  });

  it('should no create a landlord without a addressId', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: landlordWith.empty.addressId },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { name: "landlord", cpf: "12312312322", email: "landlord@landlord.com", phone: "12312312322", clientId: 1, cnpj: null }; Field "addressId" of required type "Int!" was not provided.',
    );
  });

  it('should not create a landlord without cpf or cnpj', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.empty.cpjAndCnpj },
      property: 'cpf',
      constraints: {
        containsCpfOrCnpj: 'cpf or cnpj must contain a valid value',
      },
    }));

  it('should not create a landlord wit wrong cpf length', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.wrong.cpfLength },
      property: 'cpf',
      constraints: {
        cpfLengthValidator: 'cpf should have 11 digits',
      },
    }));

  it('should not create a landlord wit wrong cnpj length', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.wrong.cnpjLength },
      property: 'cnpj',
      constraints: {
        cnpjLengthValidator: 'cnpj should have 14 digits',
      },
    }));

  it('should not create a landlord with letters and special characters in cpf', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.lettersAndSpecialChars.inCpf },
      property: 'cpf',
      constraints: {
        hasOnlyDigits: 'cpf should have only digits.',
      },
    }));

  it('should not create a landlord with letters and special characters in cnpj', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.lettersAndSpecialChars.inCnpj },
      property: 'cnpj',
      constraints: {
        hasOnlyDigits: 'cnpj should have only digits.',
      },
    }));

  it('should not create a landlord with empty email', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.empty.email },
      property: 'email',
      constraints: {
        isNotEmpty: 'email should not be empty',
        isEmail: 'email is invalid.',
      },
    }));

  it('should not create a landlord with invalid email pattern', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.invalid.emailPattern },
      property: 'email',
      constraints: {
        isEmail: 'email is invalid.',
      },
    }));

  it('should not create a landlord with empty phone', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.empty.phone },
      property: 'phone',
      constraints: {
        isNotEmpty: 'phone should not be empty',
      },
    }));

  it('should not create a landlord with wrong phone length', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.wrong.phoneLength },
      property: 'phone',
      constraints: {
        phoneLengthValidator: 'phone should have 10 or 11 digits',
      },
    }));

  it('should not create a landlord with letters or special characters in phone', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.lettersAndSpecialChars.inPhone },
      property: 'phone',
      constraints: {
        hasOnlyDigits: 'phone should have only digits.',
      },
    }));

  it('should not create a landlord with empty name', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.empty.name },
      property: 'name',
      constraints: {
        isNotEmpty: 'name should not be empty',
      },
    }));

  it('should not create a landlord with numbers and special characters in name', async () =>
    await requestAndCheckError('createLandlord')({
      app,
      token,
      query: createMutation,
      variables: { input: landlordWith.numbersAndSpecialChars.inName },
      property: 'name',
      constraints: {
        hasOnlyLetters: 'name should have only letters.',
      },
    }));
});
