import { TestingModule } from '@nestjs/testing';
import { TenantResolver } from './tenant.resolver';
import { Tenant } from './entities/tenant.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateTenantInput } from './dto/create-tenant.input';
import { createTenantTestingModule } from './testConfig/tenant.testing.module';
import { validate } from 'class-validator';

describe('TenantResolver', () => {
  let resolver: TenantResolver;
  let tenantModel: typeof Tenant;

  beforeEach(async () => {
    const module: TestingModule = await createTenantTestingModule();

    resolver = module.get<TenantResolver>(TenantResolver);
    tenantModel = module.get<typeof Tenant>(getModelToken(Tenant));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return an array of tenants', async () => {
    const tenants = [{ name: 'tenant' }, { name: 'tenant2' }] as Tenant[];
    (tenantModel.findAll as jest.Mock).mockResolvedValue(tenants);

    expect(await resolver.findAll()).toEqual(tenants);
  });

  it('should return a tenant if found', async () => {
    const tenant = { name: 'tenant2', id: 1 } as Tenant;
    (tenantModel.findByPk as jest.Mock).mockResolvedValue(tenant);

    expect(await resolver.findOne(1)).toEqual(tenant);
  });

  it('should return null if no tenant found', async () => {
    const tenant = null;
    (tenantModel.findByPk as jest.Mock).mockResolvedValue(tenant);

    expect(await resolver.findOne(1)).toEqual(tenant);
  });

  it('should create a tenant', async () => {
    const input = {
      name: 'tenant',
      cpf: '12312312322',
      email: 'gustavo@ennes.dev',
      phone: '3216549874',
    } as CreateTenantInput;
    const createdTenant = { id: 1, ...input };

    (tenantModel.create as jest.Mock).mockResolvedValue(createdTenant);

    expect(await resolver.createTenant(input)).toEqual(createdTenant);
  });

  it("shouldn't create a tenant without cpf or cnpj in input", async () => {
    const input = {
      name: 'tenant',
      email: 'gustavo@ennes.dev',
      phone: '3216549874',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

    const dtoValidation = await validate(dtoInstance);
    expect(dtoValidation).toBeInstanceOf(Array);
  });

  it("shouldn't create a tenant with wrong cpf length", async () => {
    const input = {
      name: 'tenant',
      email: 'gustavo@ennes.dev',
      phone: '3216549874',
      cpf: '123',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: 'tenant',
      email: 'gustavo@ennes.dev',
      phone: '3216549874',
      cpf: '123asd123!.',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: 'tenant',
      email: 'gustavo@ennes.dev',
      phone: '3216549874',
      cnpj: '123',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: 'tenant',
      email: 'gustavo@ennes.dev',
      phone: '3216549874',
      cnpj: 's4123ad123!!..',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: '',
      email: 'gustavo@ennes.dev',
      phone: '3216549874',
      cnpj: '12312312312322',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('name');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'name should not be empty',
    );
  });

  it("shouldn't create a tenant with empty email", async () => {
    const input = {
      name: 'gustavo',
      email: '',
      phone: '3216549874',
      cnpj: '12312312312322',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: 'gustavo',
      email: '!@.com.e',
      phone: '3216549874',
      cnpj: '12312312312322',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: 'gustavo',
      email: 'gustavo@ennes.dev',
      phone: '',
      cnpj: '12312312312322',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: 'gustavo',
      email: 'gustavo@ennes.dev',
      phone: '123',
      cnpj: '12312312312322',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

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
    const input = {
      name: 'gustavo',
      email: 'gustavo@ennes.dev',
      phone: '123asd123!.',
      cnpj: '12312312312322',
    } as CreateTenantInput;
    const dtoInstance = Object.assign(new CreateTenantInput(), input);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('phone');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'hasOnlyDigits',
      'phone should have only digits.',
    );
  });
});
