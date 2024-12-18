import { TestingModule } from '@nestjs/testing';
import { TenantResolver } from './tenant.resolver';
import { Tenant } from './entities/tenant.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateTenantInput } from './dto/create-tenant.input';
import { createTenantTestingModule } from './testConfig/tenant.test.config';
import { validate } from 'class-validator';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { ELegalType } from '../enum/legal-type.enum';
import { Client } from '../../application/client/entities/client.entity';
import { Address } from '../../application/address/entities/address.entity';

describe('TenantResolver', () => {
  let resolver: TenantResolver;
  let tenantModel: typeof Tenant;
  let clientModel: typeof Client;
  let addressModel: typeof Address;
  const input: CreateTenantInput = {
    name: 'tenant',
    cpf: '12312312322',
    email: 'gustavo@ennes.dev',
    phone: '3216549874',
    clientId: 1,
    addressId: 1,
    cnpj: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await createTenantTestingModule();

    resolver = module.get<TenantResolver>(TenantResolver);
    tenantModel = module.get<typeof Tenant>(getModelToken(Tenant));
    clientModel = module.get<typeof Client>(getModelToken(Client));
    addressModel = module.get<typeof Address>(getModelToken(Address));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return an array of tenants', async () => {
    const tenants = [{ name: 'tenant' }, { name: 'tenant2' }] as Tenant[];
    (addressModel.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (tenantModel.findAll as jest.Mock).mockResolvedValue(tenants);

    expect(await resolver.findAll()).toEqual(tenants);
  });

  it('should return a tenant if found', async () => {
    const tenant = { name: 'tenant2', id: 1 } as Tenant;
    (addressModel.findOne as jest.Mock).mockResolvedValueOnce({ id: 1 });
    (tenantModel.findByPk as jest.Mock).mockResolvedValueOnce(tenant);

    const res = await resolver.findOne(1);

    expect(res).toEqual(tenant);
  });

  it('should return null if no tenant found', async () => {
    const tenant = null;
    (tenantModel.findByPk as jest.Mock).mockResolvedValue(tenant);

    expect(await resolver.findOne(1)).toEqual(tenant);
  });

  it('should create a tenant', async () => {
    const createdTenant = { id: 1, ...input, reload: jest.fn() };
    const client = { id: 2 };

    (tenantModel.create as jest.Mock).mockResolvedValue(createdTenant);
    (tenantModel.findAll as jest.Mock).mockResolvedValue([createdTenant]);
    (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({ id: 1 });
    (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);

    expect(await resolver.createTenant(input)).toEqual(createdTenant);
    expect(createdTenant.reload).toHaveBeenCalled();
  });

  it('should create a tenant if address does not exists', async () => {
    try {
      const client = { id: 2 };

      (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);

      await resolver.createTenant(input);
    } catch (error) {
      expect(error).toHaveProperty('response', {
        message: 'No address found with provided addressId.',
        error: 'Not Found',
        statusCode: 404,
      });
    }
  });

  it('should not create a tenant if address is already associated to another entity', async () => {
    try {
      const client = { id: 2 };

      (clientModel.findByPk as jest.Mock).mockResolvedValueOnce(client);
      (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({
        id: 1,
        landlord: { id: 1 },
        isAssociated: function () {
          return !!this.landlord;
        },
      });

      await resolver.createTenant(input);
    } catch (error) {
      expect(error).toHaveProperty('response', {
        message: 'Address already associated to another entity.',
        error: 'Bad Request',
        statusCode: 400,
      });
    }
  });

  it("shouldn't create a tenant without cpf or cnpj in input", async () => {
    const inputWithoutCpfOrCnpj = { ...input, cpf: undefined };
    const dtoInstance = Object.assign(
      new CreateTenantInput(),
      inputWithoutCpfOrCnpj,
    );

    const dtoValidation = await validate(dtoInstance);
    expect(dtoValidation).toBeInstanceOf(Array);
  });

  it("shouldn't create a tenant with wrong cpf length", async () => {
    const dtoObj = { ...input, cpf: '212' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cpfLengthValidator',
      'cpf should have 11 digits',
    );
  });

  it("shouldn't create a tenant with letters or special characters in cpf", async () => {
    const dtoObj = { ...input, cpf: '123asd123@@' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cpf should have only digits.',
    );
  });

  it("shouldn't create a tenant with wrong cnpj length", async () => {
    const dtoObj = { ...input, cpf: undefined, cnpj: '123' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cnpjLengthValidator',
      'cnpj should have 14 digits',
    );
  });

  it("shouldn't create a tenant with letters or special characters in cnpj", async () => {
    const dtoObj = { ...input, cpf: undefined, cnpj: '123asd123asd@@' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cnpj should have only digits.',
    );
  });

  it("shouldn't create a tenant with empty name", async () => {
    const dtoObj = { ...input, name: '' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'name should not be empty',
    );
  });

  it("shouldn't create a tenant with letters or special characters in name", async () => {
    const dtoObj = { ...input, name: 'gu$7@v0' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyLetters',
      'name should have only letters.',
    );
  });

  it("shouldn't create a tenant with empty email", async () => {
    const dtoObj = { ...input, email: '' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'email should not be empty',
    );
  });

  it("shouldn't create a tenant with invalid email", async () => {
    const dtoObj = { ...input, email: '12@.com.##' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isEmail',
      'email is invalid.',
    );
  });

  it("shouldn't create a tenant with empty phone", async () => {
    const dtoObj = { ...input, phone: '' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'phone should not be empty',
    );
  });

  it("shouldn't create a tenant with wrong phone length", async () => {
    const dtoObj = { ...input, phone: '123123123123123123' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'phoneLengthValidator',
      'phone should have 10 or 11 digits',
    );
  });

  it("shouldn't create a tenant with phone that contains letters or special characters", async () => {
    const dtoObj = { ...input, phone: '123add123#!' };
    const dtoInstance = Object.assign(new CreateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'phone should have only digits.',
    );
  });

  it('should update a tenant', async () => {
    const tenantToUpdate = {
      id: 1,
      ...input,
      tenantType: ELegalType.Natural,
      addressId: 2,
      update: jest.fn(),
      reload: jest.fn(),
    } as UpdateTenantInput;

    (tenantModel.findOne as jest.Mock).mockResolvedValue(tenantToUpdate);
    (addressModel.findByPk as jest.Mock).mockResolvedValueOnce({ id: 2 });
    (tenantModel.update as jest.Mock).mockResolvedValue(true);
    (tenantModel.findAll as jest.Mock).mockResolvedValue([tenantToUpdate]);
    (clientModel.findByPk as jest.Mock).mockResolvedValueOnce({ id: 2 });

    expect(
      await resolver.updateTenant({ id: tenantToUpdate.id, name: 'New Name' }),
    ).toEqual(tenantToUpdate);
    expect((tenantToUpdate as any).update).toHaveBeenCalled();
    expect((tenantToUpdate as any).reload).toHaveBeenCalled();
  });

  it("shouldn't update a tenant if name is empty", async () => {
    const dtoObj = { id: 1, name: '', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'name should not be empty',
    );
  });

  it("shouldn't update a tenant if name has numbers or specialCharacters", async () => {
    const dtoObj = { id: 1, name: 'asd123s@', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyLetters',
      'name should have only letters.',
    );
  });

  it("shouldn't update a tenant if phone is empty", async () => {
    const dtoObj = { id: 1, phone: '', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'phone should not be empty',
    );
  });

  it("shouldn't update a tenant if phone has wrong length", async () => {
    const dtoObj = { id: 1, phone: '123123123123123123', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'phoneLengthValidator',
      'phone should have 10 or 11 digits',
    );
  });

  it("shouldn't update a tenant if phone has letters or special characters", async () => {
    const dtoObj = { id: 1, phone: '123asd123@@', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'phone should have only digits.',
    );
  });

  it("shouldn't update a tenant if email is empty", async () => {
    const dtoObj = { id: 1, email: '', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'email should not be empty',
    );
  });

  it("shouldn't update a tenant if email is invalid", async () => {
    const dtoObj = { id: 1, email: 's@.cdd.123#', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('email');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isEmail',
      'email is invalid.',
    );
  });

  it("shouldn't update a tenant cpf if tenant has cnpj", async () => {
    const tenantToUpdate = {
      id: 1,
      ...input,
      tenantType: ELegalType.Natural,
      update: jest.fn(),
    } as UpdateTenantInput;

    (tenantModel.findOne as jest.Mock).mockResolvedValue(tenantToUpdate);

    try {
      await resolver.updateTenant({
        id: tenantToUpdate.id,
        cnpj: '12312312312322',
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Cannot update a cpf of a legal tenant or the cnpj of a natural tenant.',
      );
      expect((tenantToUpdate as any).update).not.toHaveBeenCalled();
    }
  });

  it("shouldn't update a tenant cnpj if tenant has cpf", async () => {
    const tenantToUpdate = {
      id: 1,
      ...input,
      cpf: undefined,
      cnpj: '32132132132122',
      tenantType: ELegalType.Legal,
      update: jest.fn(),
    } as UpdateTenantInput;

    (tenantModel.findOne as jest.Mock).mockResolvedValue(tenantToUpdate);

    try {
      await resolver.updateTenant({
        id: tenantToUpdate.id,
        cpf: '32132132155',
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Cannot update a cpf of a legal tenant or the cnpj of a natural tenant.',
      );
      expect((tenantToUpdate as any).update).not.toHaveBeenCalled();
    }
  });

  it("shouldn't update a tenant if cpf has wrong length", async () => {
    const dtoObj = { id: 1, cpf: '123', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cpfLengthValidator',
      'cpf should have 11 digits',
    );
  });

  it("shouldn't update a tenant if cnpj has wrong length", async () => {
    const dtoObj = { id: 1, cnpj: '123', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'cnpjLengthValidator',
      'cnpj should have 14 digits',
    );
  });

  it("shouldn't update a tenant if cnpj has letters or special characters", async () => {
    const dtoObj = { id: 1, cnpj: '123asd123asd##', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cnpj');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cnpj should have only digits.',
    );
  });

  it("shouldn't update a tenant if cpf has letters or special characters", async () => {
    const dtoObj = { id: 1, cpf: '123sasd##!ss', update: jest.fn() };
    const dtoInstance = Object.assign(new UpdateTenantInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('cpf');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'cpf should have only digits.',
    );
  });

  it("shouldn't update a tenant if it's inactivated(activate first)", async () => {
    const tenantToUpdate = {
      id: 1,
      ...input,
      tenantType: ELegalType.Natural,
      update: jest.fn(),
      isActive: false,
    } as UpdateTenantInput;

    (tenantModel.findOne as jest.Mock).mockResolvedValue(tenantToUpdate);

    try {
      await resolver.updateTenant({
        id: tenantToUpdate.id,
        cpf: '32565898744',
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Tenant is not active. First update with only id and isActive=true, after update other properties in another call.',
      );
      expect((tenantToUpdate as any).update).not.toHaveBeenCalled();
    }
  });

  it('should activate a deactivated tenant', async () => {
    const tenantToUpdate = {
      id: 1,
      ...input,
      tenantType: ELegalType.Natural,
      update: jest.fn(),
      reload: jest.fn(),
      isActive: false,
    } as UpdateTenantInput;

    (tenantModel.findOne as jest.Mock).mockResolvedValue(tenantToUpdate);
    (tenantModel.update as jest.Mock).mockResolvedValue(true);
    (tenantModel.findAll as jest.Mock).mockResolvedValue([tenantToUpdate]);

    expect(
      await resolver.updateTenant({ id: tenantToUpdate.id, isActive: true }),
    ).toEqual(tenantToUpdate);
    expect((tenantToUpdate as any).update).toHaveBeenCalled();
    expect((tenantToUpdate as any).reload).toHaveBeenCalled();
  });

  it('should remove a tenant', async () => {
    const tenantToUpdate = {
      id: 1,
      ...input,
      tenantType: ELegalType.Natural,
      destroy: jest.fn(),
    } as UpdateTenantInput;

    (tenantModel.findByPk as jest.Mock).mockResolvedValue(tenantToUpdate);

    expect(await resolver.removeTenant(tenantToUpdate.id)).toEqual(true);
    expect((tenantToUpdate as any).destroy).toHaveBeenCalled();
  });

  it('should do nothing if cannot find a tenant to remove', async () => {
    (tenantModel.findByPk as jest.Mock).mockResolvedValue(null);
    try {
      await resolver.removeTenant(1111);
    } catch (error) {
      expect(error.message).toEqual('Tenant not found.');
      expect(error.status).toEqual(404);
    }
  });
});
