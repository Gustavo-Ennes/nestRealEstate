import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './entities/tenant.entity';
import { ELegalType } from '../enum/legal-type.enum';
import { ClientService } from '../../application/client/client.service';
import { Client } from '../../application/client/entities/client.entity';
import { AddressService } from '../../application/address/address.service';
import { Address } from '../../application/address/entities/address.entity';
import { CacheService } from '../../application/cache/cache.service';
import { ModuleNames } from '../../application/cache/cache.utils';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant)
    private readonly tenantModel: typeof Tenant,
    private readonly clientService: ClientService,
    private readonly addressService: AddressService,
    private readonly cacheService: CacheService,
  ) {}

  private readonly logger = new Logger(TenantService.name);
  private readonly includeOptions = {
    include: [{ model: Address }, { model: Client }],
  };

  async create(createTenantDto: CreateTenantInput): Promise<Tenant> {
    try {
      const { addressId, clientId } = createTenantDto;
      const client = await this.clientService.findOne(clientId);
      const address = await this.addressService.findOne(addressId);

      if (!client)
        throw new NotFoundException('Client not found with provided id.');

      if (!address)
        throw new NotFoundException(
          'No address found with provided addressId.',
        );

      if (address.isAssociated)
        throw new BadRequestException(
          'Address already associated to another entity.',
        );

      const newTenant: Tenant = await this.tenantModel.create(createTenantDto);
      await newTenant.reload(this.includeOptions);
      const tenants: Tenant[] = await this.tenantModel.findAll();

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Tenant,
        createdOrUpdated: newTenant,
        allEntities: tenants,
      });

      return newTenant;
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createTenantDto },
      );
      throw error;
    }
  }

  async findAll(): Promise<Tenant[]> {
    try {
      const cachedTenants = (await this.cacheService.getFromCache(
        ModuleNames.Tenant,
      )) as Tenant[];
      if (cachedTenants) return cachedTenants;

      const tenants: Tenant[] = await this.tenantModel.findAll(
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Tenant,
        allEntities: cachedTenants,
      });

      return tenants;
    } catch (error) {
      this.logger.error(
        `${this.findAll.name} -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<Tenant> {
    try {
      const cacheTenant: Tenant | null = (await this.cacheService.getFromCache(
        ModuleNames.Tenant,
        id,
      )) as Tenant;
      if (cacheTenant) return cacheTenant;

      const tenant: Tenant = await this.tenantModel.findByPk(
        id,
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Tenant,
        createdOrUpdated: tenant,
      });
      return tenant;
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }

  async update(updateTenantDto: UpdateTenantInput): Promise<Tenant> {
    try {
      let client: Client;
      let address: Address;
      const { id, clientId, addressId } = updateTenantDto;
      const tenant = await this.tenantModel.findOne({
        where: { id },
      });
      const { tenantType } = tenant;

      if (!tenant) throw new NotFoundException('No tenant found.');

      const dtoKeys = Object.keys(updateTenantDto);
      if (
        tenant.isActive === false &&
        (dtoKeys.length !== 2 || !dtoKeys.includes('isActive'))
      )
        throw new NotAcceptableException(
          'Tenant is not active. First update with only id and isActive=true, after update other properties in another call.',
        );

      if (
        (tenantType === ELegalType.Legal && updateTenantDto.cpf?.length > 0) ||
        (tenantType === ELegalType.Natural && updateTenantDto.cnpj?.length > 0)
      )
        throw new ConflictException(
          'Cannot update a cpf of a legal tenant or the cnpj of a natural tenant.',
        );

      if (updateTenantDto.clientId) {
        client = await this.clientService.findOne(clientId);
      }
      if (updateTenantDto.clientId && !client)
        throw new NotFoundException('Client not found with provided id.');

      if (addressId) address = await this.addressService.findOne(addressId);
      if (addressId && !address)
        throw new NotFoundException(
          'No address found with provided addressId.',
        );
      if (address && address.isAssociated)
        throw new BadRequestException(
          'Address already associated to another entity.',
        );

      await tenant.update(updateTenantDto);
      await tenant.reload(this.includeOptions);
      const tenants: Tenant[] = await this.tenantModel.findAll();

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Tenant,
        createdOrUpdated: tenant,
        allEntities: tenants,
      });

      return tenant;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { updateTenantDto },
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const tenant = await this.findOne(id);
      if (!tenant) throw new NotFoundException('Tenant not found.');

      await tenant.destroy();
      const tenants = await this.tenantModel.findAll(this.includeOptions);

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Tenant,
        allEntities: tenants,
      });
      await this.cacheService.deleteOneFromCache(ModuleNames.Tenant, id);
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }
}
