import { Inject, Injectable } from '@nestjs/common';
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

  async create(createTenantDto: CreateTenantInput): Promise<Tenant> {
    return await this.tenantModel.create(createTenantDto as any);
  }

  async findAll(): Promise<Tenant[]> {
    const chacheTenants: Tenant[] | null =
      await this.cacheManager.get('tenants');
    if (chacheTenants) return chacheTenants;

    const tenants: Tenant[] = await this.tenantModel.findAll();
    await this.cacheManager.set('tenants', tenants);
    return tenants;
  }

  async findOne(id: number): Promise<Tenant> {
    const cacheTenant: Tenant | null = await this.cacheManager.get(
      `tenant:${id}`,
    );
    if (cacheTenant) return cacheTenant;

    const tenant: Tenant = await this.tenantModel.findByPk(id);
    await this.cacheManager.set(`tenant:${id}`, tenant);
    return await this.tenantModel.findByPk(id);
  }

  async update(
    id: number,
    updateTenantDto: UpdateTenantInput,
  ): Promise<[number]> {
    return await this.tenantModel.update(updateTenantDto, { where: { id } });
  }

  async remove(id: number): Promise<void> {
    const tenant = await this.findOne(id);
    await tenant.destroy();
  }
}
