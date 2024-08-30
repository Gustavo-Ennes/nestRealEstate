import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './entities/tenant.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant)
    private readonly tenantModel: typeof Tenant,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private readonly logger = new Logger(TenantService.name);

  async create(createTenantDto: CreateTenantInput): Promise<Tenant> {
    try {
      return await this.tenantModel.create(createTenantDto as any);
    } catch (error) {
      // const { message } = error;
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

      const tenants: Tenant[] = await this.tenantModel.findAll();
      await this.cacheManager.set('tenants', tenants);
      return tenants;
    } catch (error) {
      this.logger.error(
        `${this.findAll.name} -> ${error.message}`,
        error.stack,
      );
    }
  }

  async findOne(id: number): Promise<Tenant> {
    try {
      const cacheTenant: Tenant | null = await this.cacheManager.get(
        `tenant:${id}`,
      );
      if (cacheTenant) return cacheTenant;

      const tenant: Tenant = await this.tenantModel.findByPk(id);
      await this.cacheManager.set(`tenant:${id}`, tenant);
      return await this.tenantModel.findByPk(id);
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { id },
      );
    }
  }

  async update(
    id: number,
    updateTenantDto: UpdateTenantInput,
  ): Promise<[number]> {
    try {
      return await this.tenantModel.update(updateTenantDto, { where: { id } });
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { updateTenantDto },
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const tenant = await this.findOne(id);
      await tenant.destroy();
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { id },
      );
    }
  }
}
