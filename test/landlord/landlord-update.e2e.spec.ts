import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { updateMutation } from './queries';
import { generateToken, initApp, requestAndCheckError } from '../utils';
import { Landlord } from '../../src/domain/landlord/entities/landlord.entity';

describe('Landlord Module - Update (e2e)', () => {
  let app: INestApplication,
    sequelize: Sequelize,
    token: string,
    naturalLandlord: Landlord,
    legalLandlord: Landlord;

  beforeEach(async () => {
    const { application, db, adminToken } = await initApp();
    app = application;
    token = adminToken;
    sequelize = db;

    await sequelize.getQueryInterface().dropTable('Landlords');
    await sequelize.sync({ force: true });

    naturalLandlord = await Landlord.create({
      name: 'landlord',
      email: 'ads@dasd.com',
      phone: '12312312322',
      cpf: '12312312322',
    });
    legalLandlord = await Landlord.create({
      name: 'landlord',
      email: 'ads@dasd.com',
      phone: '12312312322',
      cnpj: '12312312312322',
    });
  });

  afterEach(async () => {
    const sequelize = app.get<Sequelize>(Sequelize);
    await sequelize.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update a landlord with admin role', async () => {
    const updateDto = {
      id: naturalLandlord.id,
      name: 'new name',
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await naturalLandlord.reload();

    expect(res.body.data).toHaveProperty('updateLandlord');
    expect(res.body.data.updateLandlord).toHaveProperty(
      'id',
      naturalLandlord.id,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'name',
      naturalLandlord.name,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'phone',
      naturalLandlord.phone,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'email',
      naturalLandlord.email,
    );
    expect(naturalLandlord.name).toBe('new name');
  });

  it('should update a landlord with landlord role', async () => {
    const updateDto = {
      id: naturalLandlord.id,
      name: 'new name',
    };
    token = generateToken({ sub: 1, role: 'landlord' });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await naturalLandlord.reload();

    expect(res.body.data).toHaveProperty('updateLandlord');
    expect(res.body.data.updateLandlord).toHaveProperty(
      'id',
      naturalLandlord.id,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'name',
      naturalLandlord.name,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'phone',
      naturalLandlord.phone,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'email',
      naturalLandlord.email,
    );
    expect(naturalLandlord.name).toBe('new name');
  });

  it('should not update a landlord with tenant role', async () => {
    const updateDto = {
      id: naturalLandlord.id,
      name: 'new name',
    };
    token = generateToken({ sub: 1, role: 'tenant' });

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors[0].extensions).toHaveProperty('originalError', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
  });

  it('should not update a legal landlord cpf(just cnpj)', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: naturalLandlord.id, cnpj: '12312312312322' } },
      property: 'cnpj',
      code: 'INTERNAL_SERVER_ERROR',
    }));

  it('should not update a natural landlord cnpj(just cpf)', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, cpf: '12312312322' } },
      property: 'cpf',
      code: 'INTERNAL_SERVER_ERROR',
    }));

  it('should not update a natural landlord with wrong cpf length', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: naturalLandlord.id, cpf: '12312' } },
      property: 'cpf',
      constraints: { cpfLengthValidator: 'cpf should have 11 digits' },
    }));

  it('should not update a legal landlord with wrong cnpj length', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, cnpj: '12312' } },
      property: 'cnpj',
      constraints: { cnpjLengthValidator: 'cnpj should have 14 digits' },
    }));

  it('should not update a legal landlord with letters or special characters in cpnj', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, cnpj: '123asd123asd@@' } },
      property: 'cnpj',
      constraints: { hasOnlyDigits: 'cnpj should have only digits.' },
    }));

  it('should not update a natural landlord with letters or special characters in cpf', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, cpf: '123asd123@@' } },
      property: 'cpf',
      constraints: { hasOnlyDigits: 'cpf should have only digits.' },
    }));

  it('should not update a landlord with digits or special characters in name', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, name: '123asd123@@' } },
      property: 'name',
      constraints: { hasOnlyLetters: 'name should have only letters.' },
    }));

  it('should not update a landlord with an empty name', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, name: '' } },
      property: 'name',
      constraints: { isNotEmpty: 'name should not be empty' },
    }));

  it('should not update a landlord with letters or special characters in phone', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, phone: '123asd123!' } },
      property: 'phone',
      constraints: { hasOnlyDigits: 'phone should have only digits.' },
    }));

  it('should not update a landlord with empty phone', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, phone: '' } },
      property: 'phone',
      constraints: { isNotEmpty: 'phone should not be empty' },
    }));

  it('should not update a landlord with empty email', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, email: '' } },
      property: 'email',
      constraints: {
        isNotEmpty: 'email should not be empty',
        isEmail: 'email is invalid.',
      },
    }));

  it('should not update a landlord with invalid email', async () =>
    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: legalLandlord.id, email: '123@.com.dev@' } },
      property: 'email',
      constraints: {
        isEmail: 'email is invalid.',
      },
    }));

  it('should not update a inactive landlord', async () => {
    naturalLandlord.isActive = false;
    await naturalLandlord.save();

    await requestAndCheckError('updateLandlord')({
      app,
      token,
      query: updateMutation,
      variables: { input: { id: naturalLandlord.id, name: 'new name' } },
      property: 'name',
      constraints: {
        isEmail: 'email is invalid.',
      },
      code: 'INTERNAL_SERVER_ERROR',
    });

    naturalLandlord.isActive = true;
    await naturalLandlord.save();
  });

  it('should activate a deactivate landlord first before update something else', async () => {
    const updateDto = {
      id: naturalLandlord.id,
      isActive: true,
    };

    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateMutation,
        variables: { input: updateDto },
      })
      .expect(200);

    await naturalLandlord.reload();

    expect(res.body.data).toHaveProperty('updateLandlord');
    expect(res.body.data.updateLandlord).toHaveProperty(
      'id',
      naturalLandlord.id,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'name',
      naturalLandlord.name,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'phone',
      naturalLandlord.phone,
    );
    expect(res.body.data.updateLandlord).toHaveProperty(
      'email',
      naturalLandlord.email,
    );
    expect(naturalLandlord.isActive).toBeTruthy();
  });
});
