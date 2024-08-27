import { Injectable } from '@nestjs/common';
import { CreateTenantInput } from './dto/create-tenant.input';
import { UpdateTenantInput } from './dto/update-tenant.input';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant)
    private readonly tenantModel: typeof Tenant,
  ) {}

  async create(createTenantDto: CreateTenantInput): Promise<Tenant> {
    return await this.tenantModel.create(createTenantDto as any);
  }

  async findAll(): Promise<Tenant[]> {
    return await this.tenantModel.findAll();
  }

  async findOne(id: number): Promise<Tenant> {
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
