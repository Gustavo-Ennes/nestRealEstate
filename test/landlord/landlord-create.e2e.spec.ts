import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { createMutation } from './queries';
import { landlordWith } from './utils';
import { requestAndCheckError, initApp } from '../utils';

describe('Landlord Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeEach(async () => {
    const { application, adminToken, db } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('Landlords');
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a landlord with admin role', async () => {
    const landlordInput = {
      name: 'landlord',
      cpf: '12312312322',
      email: 'landlord@landlord.com',
      phone: '12312312322',
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: landlordInput },
      })
      .expect(200);

    expect(res.body.data).toEqual({
      createLandlord: { id: 1, ...landlordInput },
    });
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
