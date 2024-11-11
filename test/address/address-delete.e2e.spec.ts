import { INestApplication } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
import { generateToken, initApp } from '../utils';
import { Address } from '../../src/application/address/entities/address.entity';
import { removeMutation } from './queries';
import { ERole } from '../../src/application/auth/role/role.enum';
import { addressInput } from './utils';

describe('Address module - Delete (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let address: Address;

  beforeAll(async () => {
    const { application, db } = await initApp();
    app = application;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Addresses');
    await sequelize.sync({ force: true });

    address = await Address.create(addressInput);
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  it('should delete a address with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: removeMutation,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('removeAddress', true);
  });

  it('should delete a address with admin role', async () => {
    const adminToken = generateToken({ sub: 1, role: ERole.Admin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: removeMutation,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('removeAddress', true);
  });

  it('should delete a address with tenant role', async () => {
    const tenantToken = generateToken({ sub: 1, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: removeMutation,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('removeAddress', true);
  });

  it('should delete a address with landlord role', async () => {
    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: removeMutation,
        variables: { input: 1 },
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('removeAddress', true);
  });

  it('should throw if no address found', async () => {
    await address.destroy();

    const landlordToken = generateToken({ sub: 1, role: ERole.Landlord });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: removeMutation,
        variables: { input: 1 },
      })
      .expect(200);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0]).toHaveProperty(
      'message',
      'Address not found with provided id.',
    );
  });
});
