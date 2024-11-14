import { TestingModule } from '@nestjs/testing';
import { AddressResolver } from './address.resolver';
import { Address } from './entities/address.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateAddressInput } from './dto/create-address.input';
import { createAddressTestingModule } from './testConfig/address.test.config';
import { validationPipe } from '../pipes/validation.pipe';
import { assoc, dissoc } from 'ramda';
import { UpdateAddressInput } from './dto/update-address.input';

describe('AddressResolver', () => {
  let resolver: AddressResolver;
  let addressModel: typeof Address;
  const addressInput: CreateAddressInput = {
    city: 'Ilha Solteira',
    neighborhood: 'Zona norte',
    number: '43',
    postalCode: '15385088',
    state: 'SP',
    street: 'Passeio Monção',
  };

  beforeEach(async () => {
    const module: TestingModule = await createAddressTestingModule();

    resolver = module.get<AddressResolver>(AddressResolver);
    addressModel = module.get<typeof Address>(getModelToken(Address));
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('Create', () => {
    it('should create an address', async () => {
      const address = {
        id: 1,
        ...addressInput,
        reload: jest.fn(),
      };
      (addressModel.create as jest.Mock).mockResolvedValueOnce(address);

      const response = await resolver.createAddress(addressInput);
      expect(response).toEqual(
        expect.objectContaining({ id: 1, ...addressInput }),
      );
      expect(address.reload).toHaveBeenCalled();
    });

    it('should not create an address without a street', async () => {
      const inputWithoutStreet = dissoc('street', addressInput);

      try {
        await validationPipe.transform(inputWithoutStreet, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'street');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'street should not be empty',
          isString: 'street must be a string',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address without a number', async () => {
      const inputWithoutNumber = dissoc('number', addressInput);

      try {
        await validationPipe.transform(inputWithoutNumber, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'number');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'number should not be empty',
          isString: 'number must be a string',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address without a neighborhood', async () => {
      const inputWithoutNeighborhood = dissoc('neighborhood', addressInput);

      try {
        await validationPipe.transform(inputWithoutNeighborhood, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'neighborhood',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'neighborhood should not be empty',
          isString: 'neighborhood must be a string',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address without a city', async () => {
      const inputWithoutCity = dissoc('city', addressInput);

      try {
        await validationPipe.transform(inputWithoutCity, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'city');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'city should not be empty',
          isString: 'city must be a string',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address without a postal code', async () => {
      const inputWithoutPostalCode = dissoc('postalCode', addressInput);

      try {
        await validationPipe.transform(inputWithoutPostalCode, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'postalCode',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'postalCode should not be empty',
          isString: 'postalCode must be a string',
          matches: 'The "postalCode" field must be in the format 00000000.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with an empty street', async () => {
      const inputWithEmptyStreet = assoc('street', '', addressInput);

      try {
        await validationPipe.transform(inputWithEmptyStreet, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'street');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'street should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with an empty number', async () => {
      const inputWithEmptyNumber = assoc('number', '', addressInput);

      try {
        await validationPipe.transform(inputWithEmptyNumber, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'number');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'number should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with an empty neighborhood', async () => {
      const inputWithEmptyNeighborhood = assoc(
        'neighborhood',
        '',
        addressInput,
      );

      try {
        await validationPipe.transform(inputWithEmptyNeighborhood, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'neighborhood',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'neighborhood should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with an empty city', async () => {
      const inputWithEmptyCity = assoc('city', '', addressInput);

      try {
        await validationPipe.transform(inputWithEmptyCity, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'city');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'city should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with an empty state', async () => {
      const inputWithEmptyState = assoc('state', '', addressInput);

      try {
        await validationPipe.transform(inputWithEmptyState, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'state');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'state should not be empty',
          matches:
            'The "state" field must be the state abbreviation in uppercase letters.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with an empty postal code', async () => {
      const inputWithEmptyPostalCode = assoc('postalCode', '', addressInput);

      try {
        await validationPipe.transform(inputWithEmptyPostalCode, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'postalCode',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'postalCode should not be empty',
          matches: 'The "postalCode" field must be in the format 00000000.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with lowercase letters state', async () => {
      const inputWithInvalidState = assoc('state', 'sp', addressInput);

      try {
        await validationPipe.transform(inputWithInvalidState, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'state');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          matches:
            'The "state" field must be the state abbreviation in uppercase letters.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not create an address with wrong postal code format', async () => {
      const inputWithInvalidPostalCode = assoc(
        'postalCode',
        '34.180.154-X',
        addressInput,
      );

      try {
        await validationPipe.transform(inputWithInvalidPostalCode, {
          type: 'body',
          metatype: CreateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'postalCode',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          matches: 'The "postalCode" field must be in the format 00000000.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });
  });

  describe('Find', () => {
    it('should list all the addresses', async () => {
      (addressModel.findAll as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          ...addressInput,
        },
      ]);

      const response = await resolver.findAll();
      expect(response).toEqual([{ id: 1, ...addressInput }]);
    });

    it('should list one address', async () => {
      (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({
        id: 1,
        ...addressInput,
      });

      const response = await resolver.findOne(1);
      expect(response).toEqual({ id: 1, ...addressInput });
    });

    it('should return undefined if address not found', async () => {
      const response = await resolver.findOne(1);
      expect(response).toBeUndefined();
    });
  });

  describe('Delete', () => {
    it('should delete an address', async () => {
      const addressToRemove = {
        id: 1,
        ...addressInput,
        destroy: jest.fn(),
      };
      (addressModel.findByPk as jest.Mock).mockResolvedValueOnce(
        addressToRemove,
      );

      const response = await resolver.removeAddress(1);
      expect(response).toBeTruthy();
      expect(addressToRemove.destroy).toHaveBeenCalled();
    });
    it('should throw if address not found', async () => {
      try {
        await resolver.removeAddress(1);
      } catch (error) {
        expect(error).toHaveProperty('response', {
          message: 'Address not found with provided id.',
          error: 'Not Found',
          statusCode: 404,
        });
      }
    });
  });

  describe('Update', () => {
    it('should update an address', async () => {
      const addressToUpdate = {
        id: 1,
        ...addressInput,
        reload: jest.fn(),
      };
      const updatePayload: UpdateAddressInput = {
        id: 1,
        state: 'AM',
      };
      (addressModel.findByPk as jest.Mock).mockResolvedValueOnce(
        addressToUpdate,
      );
      (addressModel.update as jest.Mock).mockImplementationOnce(() => {
        addressToUpdate.state = updatePayload.state;
      });

      const res = await resolver.updateAddress(updatePayload);
      expect(addressToUpdate.reload).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining(updatePayload));
    });

    it('should not update an address if it does not exists', async () => {
      try {
        await resolver.updateAddress({ id: 1, state: 'CE' });
      } catch (error) {
        expect(error).toHaveProperty('response', {
          message: 'Address not found with provided id.',
          error: 'Not Found',
          statusCode: 404,
        });
      }
    });

    it('should not update an address with an empty street', async () => {
      const inputWithEmptyStreet = { id: 1, street: '' };
      try {
        await validationPipe.transform(inputWithEmptyStreet, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'street');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'street should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update an address with an empty number', async () => {
      const inputWithEmptyNumber = { id: 1, number: '' };

      try {
        await validationPipe.transform(inputWithEmptyNumber, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'number');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'number should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update an address with an empty neighborhood', async () => {
      const inputWithEmptyNeighborhood = { id: 1, neighborhood: '' };

      try {
        await validationPipe.transform(inputWithEmptyNeighborhood, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'neighborhood',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'neighborhood should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update an address with an empty city', async () => {
      const inputWithEmptyCity = { id: 1, city: '' };

      try {
        await validationPipe.transform(inputWithEmptyCity, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'city');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'city should not be empty',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update an address with an empty state', async () => {
      const inputWithEmptyState = { id: 1, state: '' };

      try {
        await validationPipe.transform(inputWithEmptyState, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'state');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'state should not be empty',
          matches:
            'The "state" field must be the state abbreviation in uppercase letters.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update an address with an empty postal code', async () => {
      const inputWithEmptyPostalCode = { id: 1, postalCode: '' };

      try {
        await validationPipe.transform(inputWithEmptyPostalCode, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'postalCode',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          isNotEmpty: 'postalCode should not be empty',
          matches: 'The "postalCode" field must be in the format 00000000.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update an address with lowercase letters state', async () => {
      const inputWithInvalidState = { id: 1, state: 'rj' };

      try {
        await validationPipe.transform(inputWithInvalidState, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty('property', 'state');
        expect(error.response.message[0]).toHaveProperty('constraints', {
          matches:
            'The "state" field must be the state abbreviation in uppercase letters.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should not update an address with wrong postal code format', async () => {
      const inputWithInvalidPostalCode = {
        id: 1,
        postalCode: '222.333.222-11',
      };

      try {
        await validationPipe.transform(inputWithInvalidPostalCode, {
          type: 'body',
          metatype: UpdateAddressInput,
        });
      } catch (error) {
        expect(error.response).toHaveProperty('message');
        expect(error.response.message).toHaveLength(1);
        expect(error.response.message[0]).toHaveProperty(
          'property',
          'postalCode',
        );
        expect(error.response.message[0]).toHaveProperty('constraints', {
          matches: 'The "postalCode" field must be in the format 00000000.',
        });
        expect(error.response).toHaveProperty('error', 'Bad Request');
      }
    });
  });
});
