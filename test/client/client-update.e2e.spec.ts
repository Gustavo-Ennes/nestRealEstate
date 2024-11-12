import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { updateMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { Client } from '../../src/application/client/entities/client.entity';
import { UpdateClientInput } from '../../src/application/client/dto/update-client.input';
import { assoc } from 'ramda';
import { clientInput } from './utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { addressInput } from '../address/utils';

describe('Client Module - Update (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let superadminToken: string;
  let address: Address;
  const updateInput: UpdateClientInput = {
    id: 1,
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

    address = await Address.create(addressInput);
    await Client.create(clientInput);
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should update a client with superadmin role', async () => {
    const inputToUpdate = assoc('name', 'new Name', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input: inputToUpdate },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('updateClient');
    expect(res.body.data.updateClient).toHaveProperty('id', 1);
    expect(res.body.data.updateClient).toHaveProperty(
      'name',
      inputToUpdate.name,
    );
    expect(res.body.data.updateClient).toHaveProperty(
      'phone',
      clientInput.phone,
    );
    expect(res.body.data.updateClient).toHaveProperty(
      'email',
      clientInput.email,
    );
    expect(res.body.data.updateClient).toHaveProperty('site', clientInput.site);
    expect(res.body.data.updateClient).toHaveProperty('cnpj', clientInput.cnpj);
    expect(res.body.data.updateClient).toHaveProperty(
      'isActive',
      clientInput.isActive,
    );
    expect(res.body.data.updateClient).toHaveProperty('addressId', 1);
    expect(res.body.data.updateClient).toHaveProperty('address', {
      id: 1,
    });
    expect(res.body.data.updateClient).toHaveProperty('createdAt');
    expect(res.body.data.updateClient).toHaveProperty('updatedAt');
  });

  it('should not update a client with admin role', async () => {
    const adminToken = generateToken({ sub: 1, role: ERole.Admin });
    const input = assoc('name', 'new name', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const input = assoc('name', 'new name', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client address if address was not found', async () => {
    await address.destroy();

    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const input = assoc('addressId', address.id, updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const input = assoc('name', 'new name', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client with an empty name', async () => {
    const input = assoc('name', '', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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
            isNotEmpty: 'name should not be empty',
          },
        },
      ],
    );
    expect(res.body.errors[0].extensions.originalError).toHaveProperty(
      'statusCode',
      400,
    );
  });
  it('should not update a client with number or special characters in name', async () => {
    const input = assoc('name', 'Gus7@v0', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client if phone contains letters or special characters', async () => {
    const input = assoc('name', 'Gus7@v0', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client if email is invalid', async () => {
    const input = assoc('email', '2@com..dd!.c', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client with an invalid site', async () => {
    const input = assoc('site', '2@com..dd!.c', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client if cnpj contains letters or special characters', async () => {
    const input = assoc('cnpj', '123123asd123!!', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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

  it('should not update a client if cnpj has wrong length', async () => {
    const input = assoc('cnpj', '123123123123123123123', updateInput);
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input },
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
