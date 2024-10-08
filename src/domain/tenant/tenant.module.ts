import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { TenantResolver } from './tenant.resolver';
import { AuthModule } from '../../application/auth/auth.module';

export const tenantModuleObject = {
  imports: [SequelizeModule.forFeature([Tenant]), AuthModule],
  providers: [TenantService, TenantResolver],
  exports: [TenantService, SequelizeModule],
};

@Module(tenantModuleObject)
export class TenantModule {}
