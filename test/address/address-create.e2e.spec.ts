import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { createMutation } from './queries';
import { generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { assoc, dissoc } from 'ramda';
import { addressInput } from './utils';

describe('Address module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeAll(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    sequelize = db;
    token = adminToken;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  it('should create an address with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: addressInput },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('createAddress');
    expect(res.body.data.createAddress).toHaveProperty('id', 1);
    expect(res.body.data.createAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'street',
      addressInput.street,
    );
  });

  it('should create an address with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: addressInput },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('createAddress');
    expect(res.body.data.createAddress).toHaveProperty('id', 1);
    expect(res.body.data.createAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'street',
      addressInput.street,
    );
  });

  it('should create an address with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: createMutation,
        variables: { input: addressInput },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('createAddress');
    expect(res.body.data.createAddress).toHaveProperty('id', 1);
    expect(res.body.data.createAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'street',
      addressInput.street,
    );
  });

  it('should create an address with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: createMutation,
        variables: { input: addressInput },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('createAddress');
    expect(res.body.data.createAddress).toHaveProperty('id', 1);
    expect(res.body.data.createAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.createAddress).toHaveProperty(
      'street',
      addressInput.street,
    );
  });

  it('should not create an address without a street', async () => {
    const inputWithoutStreet = dissoc('street', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutStreet },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'BAD_USER_INPUT',
    );
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { city: "Ilha Solteira", neighborhood: "Zona Norte", number: "666", postalCode: "18385000", state: "SP" }; Field "street" of required type "String!" was not provided.',
    );
  });

  it('should not create an address without a number', async () => {
    const inputWithoutNumber = dissoc('number', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutNumber },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'BAD_USER_INPUT',
    );
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { city: "Ilha Solteira", neighborhood: "Zona Norte", postalCode: "18385000", state: "SP", street: "Passeio Monção" }; Field "number" of required type "String!" was not provided.',
    );
  });

  it('should not create an address without a neighborhood', async () => {
    const inputWithoutNeighborhood = dissoc('neighborhood', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutNeighborhood },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'BAD_USER_INPUT',
    );
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { city: "Ilha Solteira", number: "666", postalCode: "18385000", state: "SP", street: "Passeio Monção" }; Field "neighborhood" of required type "String!" was not provided.',
    );
  });

  it('should not create an address without a city', async () => {
    const inputWithoutCity = dissoc('city', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutCity },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'BAD_USER_INPUT',
    );
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { neighborhood: "Zona Norte", number: "666", postalCode: "18385000", state: "SP", street: "Passeio Monção" }; Field "city" of required type "String!" was not provided.',
    );
  });

  it('should not create an address without a postal code', async () => {
    const inputWithoutPostalCode = dissoc('postalCode', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutPostalCode },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty(
      'code',
      'BAD_USER_INPUT',
    );
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Variable "$input" got invalid value { city: "Ilha Solteira", neighborhood: "Zona Norte", number: "666", state: "SP", street: "Passeio Monção" }; Field "postalCode" of required type "String!" was not provided.',
    );
  });

  it('should not create an address with an empty street', async () => {
    const inputWithEmptyStreet = assoc('street', '', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithEmptyStreet },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'street',
          constraints: {
            isNotEmpty: 'street should not be empty',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create an address with an empty number', async () => {
    const inputWithEmptyNumber = assoc('number', '', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithEmptyNumber },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'number',
          constraints: {
            isNotEmpty: 'number should not be empty',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create an address with an empty neighborhood', async () => {
    const inputWithEmptyNeighborhood = assoc('neighborhood', '', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithEmptyNeighborhood },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'neighborhood',
          constraints: {
            isNotEmpty: 'neighborhood should not be empty',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create an address with an empty city', async () => {
    const inputWithEmptyCity = assoc('city', '', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithEmptyCity },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'city',
          constraints: {
            isNotEmpty: 'city should not be empty',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create an address with an empty state', async () => {
    const inputWithEmptyState = assoc('state', '', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithEmptyState },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'state',
          constraints: {
            isNotEmpty: 'state should not be empty',
            matches:
              'The "state" field must be the state abbreviation in uppercase letters.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create an address with an empty postal code', async () => {
    const inputWithEmptyPostalCode = assoc('postalCode', '', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithEmptyPostalCode },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'postalCode',
          constraints: {
            isNotEmpty: 'postalCode should not be empty',
            matches: 'The "postalCode" field must be in the format 00000000.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create an address with lowercase letters state', async () => {
    const inputWithInvalidState = assoc('state', 'rj', addressInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithInvalidState },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'state',
          constraints: {
            matches:
              'The "state" field must be the state abbreviation in uppercase letters.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create an address with wrong postal code format', async () => {
    const inputWithInvalidPostalCode = assoc(
      'postalCode',
      '12.123.123-x',
      addressInput,
    );
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createMutation,
        variables: { input: inputWithInvalidPostalCode },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toHaveProperty('code', 'BAD_REQUEST');
    expect(res.body.errors[0].extensions).toHaveProperty('originalError');
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'message',
      [
        {
          property: 'postalCode',
          constraints: {
            matches: 'The "postalCode" field must be in the format 00000000.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });
});
