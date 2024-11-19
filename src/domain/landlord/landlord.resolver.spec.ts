import { TestingModule } from '@nestjs/testing';
import { LandlordResolver } from './landlord.resolver';
import { Landlord } from './entities/landlord.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateLandlordInput } from './dto/create-landlord.input';
import { createLandlordTestingModule } from './testConfig/landlord.test.config';
import { validate } from 'class-validator';
import { UpdateLandlordInput } from './dto/update-landlord.input';
import { ELegalType } from '../enum/legal-type.enum';
import { Client } from '../../application/client/entities/client.entity';
import { assoc, dissoc } from 'ramda';
import { Address } from '../../application/address/entities/address.entity';

describe('LandlordResolver', () => {
  let resolver: LandlordResolver;
  let landlordModel: typeof Landlord;
  let clientModel: typeof Client;
  let addressModel: typeof Address;
  const input: CreateLandlordInput = {
    name: 'landlord',
    cpf: '12312312322',
    email: 'gustavo@ennes.dev',
    phone: '3216549874',
    clientId: 1,
    addressId: 1,
    cnpj: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await createLandlordTestingModule();

    resolver = module.get<LandlordResolver>(LandlordResolver);
    landlordModel = module.get<typeof Landlord>(getModelToken(Landlord));
    clientModel = module.get<typeof Client>(getModelToken(Client));
    addressModel = module.get<typeof Address>(getModelToken(Address));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return an array of landlords', async () => {
    const landlords = [
      { name: 'landlord' },
      { name: 'landlord2' },
    ] as Landlord[];
    (landlordModel.findAll as jest.Mock).mockResolvedValue(landlords);

    expect(await resolver.findAll()).toEqual(landlords);
  });

  it('should return a landlord if found', async () => {
    const landlord = { name: 'landlord2', id: 1 } as Landlord;
    (landlordModel.findByPk as jest.Mock).mockResolvedValue(landlord);

    expect(await resolver.findOne(1)).toEqual(landlord);
  });

  it('should return null if no landlord found', async () => {
    const landlord = null;
    (landlordModel.findByPk as jest.Mock).mockResolvedValue(landlord);

    expect(await resolver.findOne(1)).toEqual(landlord);
  });

  it('should create a landlord', async () => {
    const createdLandlord = { id: 1, ...input, reload: jest.fn() };
    const client = { id: 1 };

    (landlordModel.create as jest.Mock).mockResolvedValue(createdLandlord);
    (landlordModel.findAll as jest.Mock).mockResolvedValue([createdLandlord]);
    (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);
    (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({ id: 1 });

    expect(await resolver.createLandlord(input)).toEqual(createdLandlord);
    expect(createdLandlord.reload).toHaveBeenCalled();
  });

  it("shouldn't create a landlord without cpf or cnpj in input", async () => {
    const inputWithoutCpfOrCnpj = { ...input, cpf: undefined };
    const dtoInstance = Object.assign(
      new CreateLandlordInput(),
      inputWithoutCpfOrCnpj,
    );

    const dtoValidation = await validate(dtoInstance);
    expect(dtoValidation).toBeInstanceOf(Array);
  });

  it('should not create a landlord if clientId is missing', async () => {
    const dtoObj = dissoc('clientId', input);
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('clientId');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'clientId should not be empty',
    );
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNumber',
      'clientId must be a number conforming to the specified constraints',
    );
  });

  it('should not create a landlord if address does not exists', async () => {
    try {
      const client = { id: 1 };

      (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);

      await resolver.createLandlord(input);
    } catch (error) {
      expect(error).toHaveProperty('response', {
        message: 'No address found with provided addressId.',
        error: 'Not Found',
        statusCode: 404,
      });
    }
  });

  it('should not create a landlord if address is already associated to another entity', async () => {
    try {
      const client = { id: 1 };

      (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);
      (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({
        id: 1,
        landlord: { id: 1 },
        isAssociated: function () {
          return !!this.landlord;
        },
      });

      await resolver.createLandlord(input);
    } catch (error) {
      expect(error).toHaveProperty('response', {
        message: 'Address already associated to another entity.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }
  });

  it('should not create a landlord if addressId is missing', async () => {
    const dtoObj = dissoc('addressId', input);
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('addressId');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'addressId should not be empty',
    );
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNumber',
      'addressId must be a number conforming to the specified constraints',
    );
  });

  it('should not create a landlord if clientId is not a number', async () => {
    const dtoObj = assoc('clientId', '1', input);
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('clientId');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNumber',
      'clientId must be a number conforming to the specified constraints',
    );
  });

  it("shouldn't create a landlord with wrong cpf length", async () => {
    const dtoObj = { ...input, cpf: '212' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cpfLengthValidator',
      'cpf should have 11 digits',
    );
  });

  it("shouldn't create a landlord with letters or special characters in cpf", async () => {
    const dtoObj = { ...input, cpf: '123asd123@@' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cpf should have only digits.',
    );
  });

  it("shouldn't create a landlord with wrong cnpj length", async () => {
    const dtoObj = { ...input, cpf: undefined, cnpj: '123' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cnpjLengthValidator',
      'cnpj should have 14 digits',
    );
  });

  it("shouldn't create a landlord with letters or special characters in cnpj", async () => {
    const dtoObj = { ...input, cpf: undefined, cnpj: '123asd123asd@@' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cnpj should have only digits.',
    );
  });

  it("shouldn't create a landlord with empty name", async () => {
    const dtoObj = { ...input, name: '' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'name should not be empty',
    );
  });

  it("shouldn't create a landlord with letters or special characters in name", async () => {
    const dtoObj = { ...input, name: 'gu$7@v0' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyLetters',
      'name should have only letters.',
    );
  });

  it("shouldn't create a landlord with empty email", async () => {
    const dtoObj = { ...input, email: '' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'email should not be empty',
    );
  });

  it("shouldn't create a landlord with invalid email", async () => {
    const dtoObj = { ...input, email: '12@.com.##' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isEmail',
      'email is invalid.',
    );
  });

  it("shouldn't create a landlord with empty phone", async () => {
    const dtoObj = { ...input, phone: '' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'phone should not be empty',
    );
  });

  it("shouldn't create a landlord with wrong phone length", async () => {
    const dtoObj = { ...input, phone: '123123123123123123' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'phoneLengthValidator',
      'phone should have 10 or 11 digits',
    );
  });

  it("shouldn't create a landlord with phone that contains letters or special characters", async () => {
    const dtoObj = { ...input, phone: '123add123#!' };
    const dtoInstance = Object.assign(new CreateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'phone should have only digits.',
    );
  });

  it('should update a landlord', async () => {
    const landlordToUpdate = {
      id: 1,
      ...input,
      landlordType: ELegalType.Natural,
      addressId: 2,
      update: jest.fn(),
      reload: jest.fn(),
    } as UpdateLandlordInput;

    (landlordModel.findOne as jest.Mock).mockResolvedValue(landlordToUpdate);
    (landlordModel.update as jest.Mock).mockResolvedValue(true);
    (landlordModel.findAll as jest.Mock).mockResolvedValue([landlordToUpdate]);
    (clientModel.findByPk as jest.Mock).mockResolvedValueOnce({ id: 2 });
    (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({ id: 2 });

    expect(
      await resolver.updateLandlord({
        id: landlordToUpdate.id,
        name: 'New Name',
        clientId: 2,
      }),
    ).toEqual(landlordToUpdate);
    expect((landlordToUpdate as any).update).toHaveBeenCalled();
    expect((landlordToUpdate as any).reload).toHaveBeenCalled();
  });

  it("shouldn't update a landlord if name is empty", async () => {
    const dtoObj = { id: 1, name: '', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'name should not be empty',
    );
  });

  it("shouldn't update a landlord if name has numbers or specialCharacters", async () => {
    const dtoObj = { id: 1, name: 'asd123s@', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyLetters',
      'name should have only letters.',
    );
  });

  it("shouldn't update a landlord if phone is empty", async () => {
    const dtoObj = { id: 1, phone: '', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'phone should not be empty',
    );
  });

  it("shouldn't update a landlord if phone has wrong length", async () => {
    const dtoObj = { id: 1, phone: '123123123123123123', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'phoneLengthValidator',
      'phone should have 10 or 11 digits',
    );
  });

  it("shouldn't update a landlord if phone has letters or special characters", async () => {
    const dtoObj = { id: 1, phone: '123asd123@@', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'phone should have only digits.',
    );
  });

  it("shouldn't update a landlord if email is empty", async () => {
    const dtoObj = { id: 1, email: '', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'email should not be empty',
    );
  });

  it("shouldn't update a landlord if email is invalid", async () => {
    const dtoObj = { id: 1, email: 's@.cdd.123#', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isEmail',
      'email is invalid.',
    );
  });

  it("shouldn't update a landlord cpf if landlord has cnpj", async () => {
    const landlordToUpdate = {
      id: 1,
      ...input,
      landlordType: ELegalType.Natural,
      update: jest.fn(),
    } as UpdateLandlordInput;

    (landlordModel.findOne as jest.Mock).mockResolvedValue(landlordToUpdate);

    try {
      await resolver.updateLandlord({
        id: landlordToUpdate.id,
        cnpj: '12312312312322',
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Cannot update a cpf of a legal landlord or the cnpj of a natural landlord.',
      );
      expect((landlordToUpdate as any).update).not.toHaveBeenCalled();
    }
  });

  it("shouldn't update a landlord cnpj if landlord has cpf", async () => {
    const landlordToUpdate = {
      id: 1,
      ...input,
      cpf: undefined,
      cnpj: '32132132132122',
      landlordType: ELegalType.Legal,
      update: jest.fn(),
    } as UpdateLandlordInput;

    (landlordModel.findOne as jest.Mock).mockResolvedValue(landlordToUpdate);

    try {
      await resolver.updateLandlord({
        id: landlordToUpdate.id,
        cpf: '32132132155',
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Cannot update a cpf of a legal landlord or the cnpj of a natural landlord.',
      );
      expect((landlordToUpdate as any).update).not.toHaveBeenCalled();
    }
  });

  it("shouldn't update a landlord if cpf has wrong length", async () => {
    const dtoObj = { id: 1, cpf: '123', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cpfLengthValidator',
      'cpf should have 11 digits',
    );
  });

  it("shouldn't update a landlord if cnpj has wrong length", async () => {
    const dtoObj = { id: 1, cnpj: '123', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cnpjLengthValidator',
      'cnpj should have 14 digits',
    );
  });

  it("shouldn't update a landlord if cnpj has letters or special characters", async () => {
    const dtoObj = { id: 1, cnpj: '123asd123asd##', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cnpj should have only digits.',
    );
  });

  it("shouldn't update a landlord if cpf has letters or special characters", async () => {
    const dtoObj = { id: 1, cpf: '123sasd##!ss', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateLandlordInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cpf should have only digits.',
    );
  });

  it("shouldn't update a landlord if it's inactivated(activate first)", async () => {
    const landlordToUpdate = {
      id: 1,
      ...input,
      landlordType: ELegalType.Natural,
      update: jest.fn(),
      isActive: false,
    } as UpdateLandlordInput;

    (landlordModel.findOne as jest.Mock).mockResolvedValue(landlordToUpdate);

    try {
      await resolver.updateLandlord({
        id: landlordToUpdate.id,
        cpf: '32565898744',
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Landlord is not active. First update with only id and isActive=true, after update other properties in another call.',
      );
      expect((landlordToUpdate as any).update).not.toHaveBeenCalled();
    }
  });

  it('should activate a deactivated landlord', async () => {
    const landlordToUpdate = {
      id: 1,
      ...input,
      landlordType: ELegalType.Natural,
      update: jest.fn(),
      reload: jest.fn(),
      isActive: false,
    } as UpdateLandlordInput;

    (landlordModel.findOne as jest.Mock).mockResolvedValue(landlordToUpdate);
    (landlordModel.update as jest.Mock).mockResolvedValue(true);
    (landlordModel.findAll as jest.Mock).mockResolvedValue([landlordToUpdate]);

    expect(
      await resolver.updateLandlord({
        id: landlordToUpdate.id,
        isActive: true,
      }),
    ).toEqual(landlordToUpdate);
    expect((landlordToUpdate as any).update).toHaveBeenCalled();
    expect((landlordToUpdate as any).reload).toHaveBeenCalled();
  });

  it('should remove a landlord', async () => {
    const landlordToUpdate = {
      id: 1,
      ...input,
      landlordType: ELegalType.Natural,
      destroy: jest.fn(),
    } as UpdateLandlordInput;

    (landlordModel.findByPk as jest.Mock).mockResolvedValue(landlordToUpdate);

    expect(await resolver.removeLandlord(landlordToUpdate.id)).toEqual(true);
    expect((landlordToUpdate as any).destroy).toHaveBeenCalled();
  });

  it('should do nothing if cannot find a landlord to remove', async () => {
    (landlordModel.findByPk as jest.Mock).mockResolvedValue(null);
    try {
      await resolver.removeLandlord(1111);
    } catch (error) {
      expect(error.message).toEqual('Landlord not found.');
      expect(error.status).toEqual(404);
    }
  });
});
