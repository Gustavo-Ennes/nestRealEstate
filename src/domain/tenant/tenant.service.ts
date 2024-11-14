import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './entities/tenant.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ELegalType } from '../enum/legal-type.enum';
import { ClientService } from '../../application/client/client.service';
import { Client } from '../../application/client/entities/client.entity';
import { AddressService } from '../../application/address/address.service';
import { Address } from '../../application/address/entities/address.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant)
    private readonly tenantModel: typeof Tenant,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly clientService: ClientService,
    private readonly addressService: AddressService,
  ) {}

  private readonly logger = new Logger(TenantService.name);

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

      const newTenant: Tenant = await this.tenantModel.create(createTenantDto);
      await newTenant.reload({ include: [{ model: Address }] });

      await this.cacheManager.set(`tenant:${newTenant.id}`, newTenant);
      const tenants: Tenant[] = await this.tenantModel.findAll();
      await this.cacheManager.set(
        'tenants',
        tenants.sort((a, b) => a.id - b.id),
      );

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
      const chacheTenants: Tenant[] | null =
        await this.cacheManager.get('tenants');
      if (chacheTenants) return chacheTenants;

      const tenants: Tenant[] = await this.tenantModel.findAll({
        include: [{ model: Address }],
      });
      await this.cacheManager.set(
        'tenants',
        tenants.sort((a, b) => a.id - b.id),
      );
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
      const cacheTenant: Tenant | null = await this.cacheManager.get(
        `tenant:${id}`,
      );
      if (cacheTenant) return cacheTenant;

      const tenant: Tenant = await this.tenantModel.findByPk(id, {
        include: [{ model: Address }],
      });
      await this.cacheManager.set(`tenant:${id}`, tenant);
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

      await tenant.update(updateTenantDto);
      await this.cacheManager.set(`tenant:${updateTenantDto.id}`, tenant);
      const tenants: Tenant[] = await this.tenantModel.findAll();
      await this.cacheManager.set(
        'tenants',
        tenants.sort((a, b) => a.id - b.id),
      );
      await tenant.reload({ include: [{ model: Address }] });

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
