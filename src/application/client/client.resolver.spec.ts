import { TestingModule } from '@nestjs/testing';
import { ClientResolver } from './client.resolver';
import { createClientTestingModule } from './testConfig/client.test.config';
import { getModelToken } from '@nestjs/sequelize';
import { Client } from './entities/client.entity';
import { CreateClientInput } from './dto/create-client.input';
import { assoc, dissoc } from 'ramda';
import { validationPipe } from '../pipes/validation.pipe';
import { UpdateClientInput } from './dto/update-client.input';
import { Address } from '../address/entities/address.entity';

describe('ClientResolver', () => {
  let resolver: ClientResolver;
  let clientModel: typeof Client;
  let addressModel: typeof Address;
  const clientInput: CreateClientInput = {
    cnpj: '12312312312322',
    email: 'client@business.org',
    isActive: true,
    name: 'Client',
    phone: '12312312322',
    site: 'client.com',
    addressId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await createClientTestingModule();

    resolver = module.get<ClientResolver>(ClientResolver);
    clientModel = module.get<typeof Client>(getModelToken(Client));
    addressModel = module.get<typeof Address>(getModelToken(Address));
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Client create', () => {
    it('should create a client', async () => {
      const client = {
        id: 1,
        ...clientInput,
        reload: jest.fn(),
      };
      (clientModel.create as jest.Mock).mockResolvedValueOnce(client);
      (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({
        id: 1,
      });

      const response = await resolver.createClient(clientInput);
      expect(response).toEqual(
        expect.objectContaining({ id: 1, ...clientInput }),
      );
      expect(client.reload).toHaveBeenCalled();
    });

    it('should not create a client with an empty name', async () => {
      const inputWithEmptyName = assoc('name', '', clientInput);

      try {
        await validationPipe.transform(inputWithEmptyName, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'name');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'name should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client without an address id', async () => {
      const inputWithoutAddressId = dissoc('addressId', clientInput);

      try {
        await validationPipe.transform(inputWithoutAddressId, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'addressId',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'addressId should not be empty',
          isNumber:
            'addressId must be a number conforming to the specified constraints',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client with an empty string in addressId', async () => {
      const inputWithoutAddressId = assoc('addressId', '', clientInput);

      try {
        await validationPipe.transform(inputWithoutAddressId, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'addressId',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'addressId should not be empty',
          isNumber:
            'addressId must be a number conforming to the specified constraints',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should throw if no address found with provided addressId', async () => {
      try {
        await resolver.createClient(clientInput);
      } catch (error) {
        expect(error).toHaveProperty('response', {
          message: 'No address found with provided addressId.',
          error: 'Not Found',
          statusCode: 404,
        });
      }
    });

    it('should throw if address is already associated to another entity', async () => {
      try {
        const client = {
          id: 1,
          ...clientInput,
          reload: jest.fn(),
        };
        (clientModel.create as jest.Mock).mockResolvedValueOnce(client);
        (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({
          id: 1,
          tenant: { id: 1 },
          isAssociated: function () {
            return !!this.tenant;
          },
        });

        await resolver.createClient(clientInput);
      } catch (error) {
        expect(error).toHaveProperty('response', {
          message: 'Address already associated to another entity.',
          error: 'Bad Request',
          statusCode: 400,
        });
      }
    });

    it('should not create a client with number or special characters in name', async () => {
      const inputWithWrongName = assoc('name', 'vilma22.', clientInput);

      try {
        await validationPipe.transform(inputWithWrongName, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'name');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          hasOnlyLetters: 'name should have only letters.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client if phone is missing', async () => {
      const inputWithoutPhone = dissoc('phone', clientInput);

      try {
        await validationPipe.transform(inputWithoutPhone, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'phone');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'phone should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client if phone contains letters or special characters', async () => {
      const inputWithWrongPhone = assoc('phone', '123123123.a', clientInput);

      try {
        await validationPipe.transform(inputWithWrongPhone, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'phone');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          hasOnlyDigits: 'phone should have only digits.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client if email is missing', async () => {
      const inputWithutEmail = dissoc('email', clientInput);

      try {
        await validationPipe.transform(inputWithutEmail, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'email');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'email should not be empty',
          isEmail: 'email is invalid.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client if email is invalid', async () => {
      const inputWithutEmail = assoc('email', '2@.com.AAA!', clientInput);

      try {
        await validationPipe.transform(inputWithutEmail, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'email');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isEmail: 'email is invalid.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client with an invalid site', async () => {
      const inputWithoutEmail = assoc('site', 'http:/site..cim.1', clientInput);

      try {
        await validationPipe.transform(inputWithoutEmail, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'site');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isSite: 'site is invalid.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client if cnpj is missing', async () => {
      const inputWithoutCnpj = dissoc('cnpj', clientInput);

      try {
        await validationPipe.transform(inputWithoutCnpj, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'cnpj');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'cnpj should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client if cnpj contains letters or special characters', async () => {
      const inputWithWrongCnpj = assoc('cnpj', '321654asd3215s', clientInput);

      try {
        await validationPipe.transform(inputWithWrongCnpj, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'cnpj');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          hasOnlyDigits: 'cnpj should have only digits.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create a client if cnpj has wrong length', async () => {
      const inputWithWrongCnpj = assoc('cnpj', '123123123', clientInput);

      try {
        await validationPipe.transform(inputWithWrongCnpj, {
          type: 'body',
          metatype: CreateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'cnpj');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          cnpjLengthValidator: 'cnpj should have 14 digits',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });
  });

  describe('Client find', () => {
    it('should list all clients', async () => {
      const findAllMock = [
        {
          id: 1,
          ...clientInput,
        },
      ];
      (clientModel.findAll as jest.Mock).mockResolvedValueOnce(findAllMock);

      const response = await resolver.findAll();
      expect(response).toEqual(findAllMock);
    });

    it('should list a client', async () => {
      const findOneMock = {
        id: 1,
        ...clientInput,
      };
      (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(findOneMock);

      const response = await resolver.findOne(findOneMock.id);
      expect(response).toEqual(findOneMock);
    });

    it('should return undefined if a client is not found(findOne)', async () => {
      const response = await resolver.findOne(555);
      expect(response).toBeUndefined();
    });
  });

  describe('Client update', () => {
    it('should update a client', async () => {
      const updatePayload: UpdateClientInput = { id: 1, name: 'Other name' };
      const client = {
        id: 1,
        ...clientInput,
        reload: jest.fn(),
      };
      (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);
      (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({
        id: 1,
      });
      (clientModel.update as jest.Mock).mockImplementationOnce(() => {
        client.name = updatePayload.name;
      });

      const response = await resolver.updateClient(updatePayload);
      expect(response).toEqual(expect.objectContaining(updatePayload));
    });

    it('should not update a client with an inexistent address', async () => {
      try {
        const updatePayload: UpdateClientInput = { id: 1, name: 'Other name' };
        const client = {
          id: 1,
          ...clientInput,
          reload: jest.fn(),
        };
        (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);

        await resolver.updateClient(updatePayload);
      } catch (error) {
        expect(error).toHaveProperty('response', {
          message: 'No address found with provided addressId.',
          error: 'Not Found',
          statusCode: 404,
        });
      }
    });

    it('should not update a client address if it was already associated to another entity', async () => {
      try {
        const updatePayload: UpdateClientInput = { id: 1, name: 'Other name' };
        const client = {
          id: 1,
          ...clientInput,
          reload: jest.fn(),
        };
        (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);
        (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({
          id: 1,
          tenant: { id: 1 },
          isAssociated: function () {
            return !!this.tenant;
          },
        });

        await resolver.updateClient(updatePayload);
      } catch (error) {
        expect(error).toHaveProperty('response', {
          message: 'Address already associated to another entity.',
          error: 'Bad Request',
          statusCode: 400,
        });
      }
    });

    it('should not update a client with an empty name', async () => {
      const updateWithEmptyName = assoc('name', '', clientInput);
      try {
        await validationPipe.transform(updateWithEmptyName, {
          type: 'body',
          metatype: UpdateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'name');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: `name should not be empty`,
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update a client with number or special characters in name', async () => {
      const updateWithLettersInPhone = assoc('name', 'gus7@v0', clientInput);
      try {
        await validationPipe.transform(updateWithLettersInPhone, {
          type: 'body',
          metatype: UpdateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'name');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          hasOnlyLetters: `name should have only letters.`,
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update a client if phone contains letters or special characters', async () => {
      const updateWithWrongPhone = assoc('phone', '222123asd2!', clientInput);
      try {
        await validationPipe.transform(updateWithWrongPhone, {
          type: 'body',
          metatype: UpdateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'phone');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          hasOnlyDigits: `phone should have only digits.`,
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update a client if email is invalid', async () => {
      const updateWithInvalidEmail = assoc('email', '2@v.0.cc', clientInput);
      try {
        await validationPipe.transform(updateWithInvalidEmail, {
          type: 'body',
          metatype: UpdateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'email');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isEmail: `email is invalid.`,
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update a client with an invalid site', async () => {
      const updateWithInvalidSite = assoc('site', '2v.0.cc10@@', clientInput);
      try {
        await validationPipe.transform(updateWithInvalidSite, {
          type: 'body',
          metatype: UpdateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'site');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isSite: `site is invalid.`,
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update a client if cnpj contains letters or special characters', async () => {
      const updateWithInvalidSite = assoc(
        'cnpj',
        '123asd123qwd@@',
        clientInput,
      );
      try {
        await validationPipe.transform(updateWithInvalidSite, {
          type: 'body',
          metatype: UpdateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'cnpj');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          hasOnlyDigits: `cnpj should have only digits.`,
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update a client if cnpj has wrong length', async () => {
      const updateWithInvalidSite = assoc('cnpj', '123123122', clientInput);
      try {
        await validationPipe.transform(updateWithInvalidSite, {
          type: 'body',
          metatype: UpdateClientInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'cnpj');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          cnpjLengthValidator: `cnpj should have 14 digits`,
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });
  });

  describe('Client remove', () => {
    it('should remove a client', async () => {
      const client = { id: 1, destroy: jest.fn(), ...clientInput };
      (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);

      const response = await resolver.removeClient(client.id);
      expect(response).toBeTruthy();
    });

    it('should throw if client not found(delete)', async () => {
      const client = { id: 666, destroy: jest.fn(), ...clientInput };
      try {
        await resolver.removeClient(client.id);
      } catch (error) {
        expect(error.response).toHaveProperty(
          'message',
          'No client found with provided id.',
        );
        expect(error.response).toHaveProperty('error', 'Not Found');
      }
    });
  });
});
