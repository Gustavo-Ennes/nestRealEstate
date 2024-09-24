import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tenant } from './entities/tenant.entity';
import { TenantResolver } from './tenant.resolver';

@Module({
  imports: [SequelizeModule.forFeature([Tenant])],
  providers: [TenantService, TenantResolver],
  exports: [TenantService],
})
export class TenantModule {}
