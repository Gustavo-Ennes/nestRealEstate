import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { TenantResolver } from './tenant.resolver';
import { AuthModule } from '../../application/auth/auth.module';
import { ClientModule } from '../../application/client/client.module';
import { AddressModule } from '../../application/address/address.module';
import { CacheModule } from '../../application/cache/cache.module';

export const tenantModuleObject = {
  imports: [
    SequelizeModule.forFeature([Tenant]),
    AuthModule,
    ClientModule,
    AddressModule,
    CacheModule,
  ],
  providers: [TenantService, TenantResolver],
  exports: [TenantService, SequelizeModule],
};

@Module(tenantModuleObject)
export class TenantModule {}
