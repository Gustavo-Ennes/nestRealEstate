import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { afterAllTests, generateToken, initApp } from '../utils';
import { Landlord } from '../../src/domain/landlord/entities/landlord.entity';
import { ERole } from '../../src/application/auth/role/role.enum';

describe('Landlord Module - Delete (e2e)', () => {
  let app: INestApplication,
    sequelize: Sequelize,
    token: string,
    landlord: Landlord;

  beforeAll(async () => {
    const { application, adminToken, db } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;
  });

  beforeEach(async () => {
    await sequelize.getQueryInterface().dropTable('Landlords');
    await sequelize.sync({ force: true });

    landlord = await Landlord.create({
      name: 'landlord',
      email: 'ads@dasd.com',
      phone: '12312312322',
      cpf: '12312312322',
    });
  });

  afterAll(async () => {
    await afterAllTests(app);
  });

  it('should delete a landlord with admin role', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: landlord.id },
      })
      .expect(200);

    expect(res.body.data).toEqual({ removeLandlord: true });
  });

  it('should delete a landlord with superadmin role', async () => {
    const superadminToken = generateToken({ sub: 1, role: ERole.Superadmin });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        query: deleteMutation,
        variables: { input: landlord.id },
      })
      .expect(200);

    expect(res.body.data).toEqual({ removeLandlord: true });
  });

  it('should delete a landlord with landlord role', async () => {
    const landlordToken = generateToken({
      sub: landlord.id,
      role: ERole.Landlord,
    });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({
        query: deleteMutation,
        variables: { input: landlord.id },
      })
      .expect(200);

    expect(res.body.data).toEqual({ removeLandlord: true });
  });

  it('should not delete a landlord with tenant role', async () => {
    const tenantToken = generateToken({ sub: landlord.id, role: ERole.Tenant });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        query: deleteMutation,
        variables: { input: landlord.id },
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });

  it("should throw a 404 if landlord to delete don't exists", async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: 666 },
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Landlord not found.',
      error: 'Not Found',
      statusCode: 404,
    });
  });
});
