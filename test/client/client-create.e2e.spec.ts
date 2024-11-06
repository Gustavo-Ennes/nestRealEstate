import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { createMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { User } from '../../src/application/user/entities/user.entity';
import { CreateClientInput } from '../../src/application/client/dto/create-client.input';
import { CreateUserInput } from '../../src/application/user/dto/create-user.input';
import { assoc, dissoc } from 'ramda';

describe('Client Module - Create (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let superadminToken: string;
  let user: User;
  const userInput: CreateUserInput = {
    email: 'user@client.com',
    password: 'senha123',
    role: ERole.Admin,
    username: 'ClientAdmin',
    clientId: 1,
  };
  const clientInput: CreateClientInput = {
    cnpj: '12312312312322',
    email: 'client@client.com',
    name: 'Franz Kafka',
    phone: '12312312322',
    site: 'client.com',
    userId: 1,
    isActive: true,
  };

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Clients');
    await sequelize.sync({ force: true });
    user = await User.create(userInput);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should create a client with superadmin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: clientInput },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('createClient');
    expect(res.body.data.createClient).toHaveProperty('id', 1);
    expect(res.body.data.createClient).toHaveProperty('userId', user.id);
    expect(res.body.data.createClient).toHaveProperty('user', {
      id: user.id,
      username: user.username,
    });
    expect(res.body.data.createClient).toHaveProperty('name', clientInput.name);
    expect(res.body.data.createClient).toHaveProperty(
      'phone',
      clientInput.phone,
    );
    expect(res.body.data.createClient).toHaveProperty(
      'email',
      clientInput.email,
    );
    expect(res.body.data.createClient).toHaveProperty('site', clientInput.site);
    expect(res.body.data.createClient).toHaveProperty('cnpj', clientInput.cnpj);
    expect(res.body.data.createClient).toHaveProperty(
      'isActive',
      clientInput.isActive,
    );
  });

  it('should not create a client with admin role', async () => {
    const adminToken = generateToken({ sub: 1, role: ERole.Admin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: createMutation,
        variables: { input: clientInput },
      })
      .expect(200);

    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      originalError: {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    });
  });

  it('should not create a client with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: createMutation,
        variables: { input: clientInput },
      })
      .expect(200);

    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      originalError: {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    });
  });

  it('should not create a client with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: createMutation,
        variables: { input: clientInput },
      })
      .expect(200);

    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty('extensions');
    expect(res.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      originalError: {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    });
  });

  it('should not create a client if user id is missing', async () => {
    const inputWithoutUserId = dissoc('userId', clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutUserId },
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
      'Variable "$input" got invalid value { cnpj: "12312312312322", email: "client@client.com", name: "Franz Kafka", phone: "12312312322", site: "client.com", isActive: true }; Field "userId" of required type "Int!" was not provided.',
    );
  });

  it('should not create a client if user does not exists', async () => {
    const inputWithInexistentUser = assoc('userId', 666, clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: inputWithInexistentUser },
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
      'User not found with provided userId.',
    );
  });

  it('should not create a client without a name', async () => {
    const inputWithoutName = dissoc('name', clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutName },
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
      'Variable "$input" got invalid value { cnpj: "12312312312322", email: "client@client.com", phone: "12312312322", site: "client.com", userId: 1, isActive: true }; Field "name" of required type "String!" was not provided.',
    );
  });

  it('should not create a client with number or special characters in name', async () => {
    const inputWithNameContainingSpecialCharactersAndNumber = assoc(
      'name',
      'Gus7@v0.',
      clientInput,
    );
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: inputWithNameContainingSpecialCharactersAndNumber },
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
          property: 'name',
          constraints: {
            hasOnlyLetters: 'name should have only letters.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create a client if phone is missing', async () => {
    const inputWithoutPhone = dissoc('phone', clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutPhone },
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
      'Variable "$input" got invalid value { cnpj: "12312312312322", email: "client@client.com", name: "Franz Kafka", site: "client.com", userId: 1, isActive: true }; Field "phone" of required type "String!" was not provided.',
    );
  });

  it('should not create a client if phone contains letters or special characters', async () => {
    const inputWithPhoneContainingSpecialCharactersAndLetter = assoc(
      'phone',
      '123123asd.!',
      clientInput,
    );
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: {
          input: inputWithPhoneContainingSpecialCharactersAndLetter,
        },
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
          property: 'phone',
          constraints: {
            hasOnlyDigits: 'phone should have only digits.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create a client if email is missing', async () => {
    const inputWithoutEmail = dissoc('email', clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutEmail },
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
      'Variable "$input" got invalid value { cnpj: "12312312312322", name: "Franz Kafka", phone: "12312312322", site: "client.com", userId: 1, isActive: true }; Field "email" of required type "String!" was not provided.',
    );
  });

  it('should not create a client if email is invalid', async () => {
    const inputWithInvalidEmail = assoc('email', '2@com..dd!.c', clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: {
          input: inputWithInvalidEmail,
        },
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
          property: 'email',
          constraints: {
            isEmail: 'email is invalid.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create a client with an invalid site', async () => {
    const inputWithInvalidSite = assoc('site', '@22.com.a1', clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: {
          input: inputWithInvalidSite,
        },
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
          property: 'site',
          constraints: {
            isSite: 'site is invalid.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create a client if cnpj is missing', async () => {
    const inputWithoutCnpj = dissoc('cnpj', clientInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: { input: inputWithoutCnpj },
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
      'Variable "$input" got invalid value { email: "client@client.com", name: "Franz Kafka", phone: "12312312322", site: "client.com", userId: 1, isActive: true }; Field "cnpj" of required type "String!" was not provided.',
    );
  });

  it('should not create a client if cnpj contains letters or special characters', async () => {
    const inputWithCnpjContainingSpecialCharactersOrLetters = assoc(
      'cnpj',
      '123asd123asd!!',
      clientInput,
    );
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: {
          input: inputWithCnpjContainingSpecialCharactersOrLetters,
        },
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
          property: 'cnpj',
          constraints: {
            hasOnlyDigits: 'cnpj should have only digits.',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });

  it('should not create a client if cnpj has wrong length', async () => {
    const inputWithWrongCnpjLength = assoc(
      'cnpj',
      '123123123123123123',
      clientInput,
    );
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: createMutation,
        variables: {
          input: inputWithWrongCnpjLength,
        },
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
          property: 'cnpj',
          constraints: {
            cnpjLengthValidator: 'cnpj should have 14 digits',
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
