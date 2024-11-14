import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { hashPassword } from '../../src/application/auth/auth.utils';
import { User } from '../../src/application/user/entities/user.entity';
import { loginMutation } from './mutation';
import { defaultLoginInput, loginWithout } from './utils';
import { initApp, requestAndCheckError } from '../utils';
import { Client } from '../../src/application/client/entities/client.entity';
import { clientInput } from '../client/utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { addressInput } from '../address/utils';

describe('Auth Module - Login (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });

    await Address.create(addressInput);
    await Client.create(clientInput);
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  it('should login', async () => {
    await User.create({
      username: defaultLoginInput.username,
      password: await hashPassword(defaultLoginInput.password),
      role: 'admin',
      email: 'teste@teste.com',
      clientId: 1,
    });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: loginMutation,
        variables: { input: defaultLoginInput },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('login');
    expect(res.body.data.login).toHaveProperty('access_token');
    expect(res.body.data.login.access_token).not.toBeUndefined();
    expect(res.body.data.login.access_token).not.toBeNull();
  });

  it('should not login if username is empty', async () =>
    await requestAndCheckError('login')({
      app,
      query: loginMutation,
      variables: { input: loginWithout.username },
      property: 'username',
      constraints: {
        isNotEmpty: 'username should not be empty',
      },
    }));

  it('should not login if password is empty', async () =>
    await requestAndCheckError('login')({
      app,
      query: loginMutation,
      variables: { input: loginWithout.password },
      property: 'password',
      constraints: {
        isNotEmpty: 'password should not be empty',
      },
    }));

  it('should not login if password do not match', async () =>
    await requestAndCheckError('login')({
      app,
      query: loginMutation,
      variables: { input: { ...defaultLoginInput, password: '222' } },
      property: 'password',
      code: 'INTERNAL_SERVER_ERROR',
    }));
});
