import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { initApp } from '../utils';
import { signUpMutation } from './mutation';
import { requestAndCheckError } from '../utils';
import { defaultSignUpInput, signupWithout } from './utils';
import { User } from '../../src/application/user/entities/user.entity';

describe('Auth Module - SignUp (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let token: string;

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Users');
    await sequelize.sync({ force: true });
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

    expect(res.body.data).toHaveProperty('signUp');
    expect(res.body.data.signUp).toHaveProperty('access_token');
    expect(res.body.data.signUp.access_token).not.toBeUndefined();
    expect(res.body.data.signUp.access_token).not.toBeNull();
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
