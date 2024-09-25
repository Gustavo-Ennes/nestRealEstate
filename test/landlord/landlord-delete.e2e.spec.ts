import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { deleteMutation } from './queries';
import { generateToken, initApp } from '../utils';
import { Landlord } from '../../src/domain/landlord/entities/landlord.entity';

describe('Landlord Module - Create (e2e)', () => {
  let app: INestApplication,
    sequelize: Sequelize,
    token: string,
    landlord: Landlord;

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('Landlords');
    await sequelize.sync({ force: true });

    landlord = await Landlord.create({
      name: 'landlord',
      email: 'ads@dasd.com',
      phone: '12312312322',
      cpf: '12312312322',
    });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
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

  it('should delete a landlord with landlord role', async () => {
    token = generateToken({ sub: landlord.id, role: 'landlord' });
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

  it('should not delete a landlord with tenant role', async () => {
    token = generateToken({ sub: landlord.id, role: 'tenant' });
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
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
    await landlord.destroy();

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteMutation,
        variables: { input: landlord.id },
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
