import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { updateMutation } from './queries';
import { generateToken, initApp } from '../utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { addressInput } from './utils';
import { ERole } from '../../src/application/auth/role/role.enum';
import { UpdateAddressInput } from 'src/application/address/dto/update-address.input';

describe('Address module - Update (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let address: Address;

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });

    address = await Address.create(addressInput);
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  it('should update an address with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const updatePayload: UpdateAddressInput = {
      id: address.id,
      street: 'Rua Augusta',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('updateAddress');
    expect(res.body.data.updateAddress).toHaveProperty('id', 1);
    expect(res.body.data.updateAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'street',
      updatePayload.street,
    );
  });

  it('should update an address with admin role', async () => {
    const adminToken = generateToken({ sub: 1, role: ERole.Admin });
    const updatePayload: UpdateAddressInput = {
      id: address.id,
      street: 'Rua Augusta',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('updateAddress');
    expect(res.body.data.updateAddress).toHaveProperty('id', 1);
    expect(res.body.data.updateAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'street',
      updatePayload.street,
    );
  });

  it('should update an address with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const updatePayload: UpdateAddressInput = {
      id: address.id,
      street: 'Rua Augusta',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('updateAddress');
    expect(res.body.data.updateAddress).toHaveProperty('id', 1);
    expect(res.body.data.updateAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'street',
      updatePayload.street,
    );
  });

  it('should update an address with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const updatePayload: UpdateAddressInput = {
      id: address.id,
      street: 'Rua Augusta',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty('updateAddress');
    expect(res.body.data.updateAddress).toHaveProperty('id', 1);
    expect(res.body.data.updateAddress).toHaveProperty(
      'city',
      addressInput.city,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'neighborhood',
      addressInput.neighborhood,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'number',
      addressInput.number,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'postalCode',
      addressInput.postalCode,
    );
    expect(res.body.data.updateAddress).toHaveProperty(
      'street',
      updatePayload.street,
    );
  });

  it('should not update an address if it does not exists', async () => {
    await address.destroy();

    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const updatePayload: UpdateAddressInput = {
      id: 1,
      street: 'Rua Augusta',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: updatePayload },
      })
      .expect(200);

    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Address not found with provided id.',
    );
  });

  it('should not update an address with an empty street', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithEmptyStreet: UpdateAddressInput = {
      id: 1,
      street: '',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithEmptyStreet },
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

  it('should not update an address with an empty number', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithEmptyNumber: UpdateAddressInput = {
      id: 1,
      number: '',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithEmptyNumber },
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

  it('should not update an address with an empty neighborhood', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithEmptyNeighborhood: UpdateAddressInput = {
      id: 1,
      neighborhood: '',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithEmptyNeighborhood },
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

  it('should not update an address with an empty city', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithEmptyCity: UpdateAddressInput = {
      id: 1,
      city: '',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithEmptyCity },
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

  it('should not update an address with an empty state', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithEmptyState: UpdateAddressInput = {
      id: 1,
      state: '',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithEmptyState },
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

  it('should not update an address with an empty postal code', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithEmptyPostalCode: UpdateAddressInput = {
      id: 1,
      postalCode: '',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithEmptyPostalCode },
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

  it('should not update an address with lowercase letters state', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithInvalidState: UpdateAddressInput = {
      id: 1,
      state: 'ra',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithInvalidState },
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

  it('should not update an address with wrong postal code format', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const payloadWithInvalidPostalCode: UpdateAddressInput = {
      id: 1,
      postalCode: '123.123.123-22',
    };
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: updateMutation,
        variables: { input: payloadWithInvalidPostalCode },
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
