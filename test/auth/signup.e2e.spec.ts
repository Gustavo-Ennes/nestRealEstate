import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { initApp } from '../utils';
import { signUpMutation } from './mutation';
import { requestAndCheckError } from '../utils';
import { defaultSignUpInput, signupWithout } from './utils';
import { User } from '../../src/application/user/entities/user.entity';
import { Client } from '../../src/application/client/entities/client.entity';
import { clientInput } from '../client/utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { addressInput } from '../address/utils';
import { JwtService } from '@nestjs/jwt';

describe('Auth Module - SignUp (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;
  let jwtService: JwtService;
  let client: Client;

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    sequelize = db;
    jwtService = app.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });
    await Address.create(addressInput);
    client = await Client.create(clientInput);
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  it('should sign up', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: signUpMutation,
        variables: { input: defaultSignUpInput },
      })
      .expect(200);

    const accessToken = res.body.data.signUp.access_token;
    const decodedToken = await jwtService.decode(accessToken);

    expect(decodedToken).toHaveProperty('sub', 1);
    expect(decodedToken).toHaveProperty(
      'username',
      defaultSignUpInput.username,
    );
    expect(res.body.data).toHaveProperty('signUp');
    expect(res.body.data.signUp).toHaveProperty('access_token');
    expect(res.body.data.signUp.access_token).not.toBeUndefined();
    expect(res.body.data.signUp.access_token).not.toBeNull();

    expect(decodedToken).toHaveProperty('email', defaultSignUpInput.email);
    expect(decodedToken).toHaveProperty('role', defaultSignUpInput.role);
    expect(decodedToken).toHaveProperty(
      'client',
      expect.objectContaining({ id: client.id }),
    );
    expect(decodedToken.client).toHaveProperty('users', []);
    expect(decodedToken).toHaveProperty('iat');
  });

  it('should not sign up if username do not match criteria', async () =>
    await requestAndCheckError('signUp')({
      app,
      token,
      query: signUpMutation,
      variables: { input: signupWithout.usernameCriteria },
      property: 'username',
      constraints: {
        isValidUsername:
          'username can have only words and underscores, 5 characters minimum.',
      },
    }));

  it('should not sign up if password do not match criteria', async () =>
    await requestAndCheckError('signUp')({
      app,
      token,
      query: signUpMutation,
      variables: { input: signupWithout.passwordCriteria },
      property: 'password',
      constraints: {
        isValidPassword:
          'password must have at least 1 number, 1 special character, 1 uppercase character and five total characters minimum.',
      },
    }));

  it('should not sign up if email is invalid', async () =>
    await requestAndCheckError('signUp')({
      app,
      token,
      query: signUpMutation,
      variables: { input: signupWithout.validEmail },
      property: 'email',
      constraints: {
        isEmail: 'email is invalid.',
      },
    }));

  it('should not sign up if role is invalid', async () =>
    await requestAndCheckError('signUp')({
      app,
      token,
      query: signUpMutation,
      variables: { input: signupWithout.validRole },
      property: 'role',
      constraints: {
        isValidRole: 'guitarist is not a valid role.',
      },
    }));

  it('should not sign up if username already taken', async () => {
    await User.create({
      username: 'teste',
      password: '123',
      role: 'admin',
      email: 'teste@teste.com',
    });
    await requestAndCheckError('signUp')({
      app,
      token,
      query: signUpMutation,
      variables: { input: { ...defaultSignUpInput, username: 'teste' } },
      property: 'username',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
  it('should not sign up if email already registered', async () => {
    await User.create({
      username: 'teste',
      password: '123',
      role: 'admin',
      email: 'teste@teste.com',
    });

    await requestAndCheckError('signUp')({
      app,
      token,
      query: signUpMutation,
      variables: {
        input: {
          ...defaultSignUpInput,
          username: 'tests',
          email: 'teste@teste.com',
        },
      },
      property: 'username',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});
