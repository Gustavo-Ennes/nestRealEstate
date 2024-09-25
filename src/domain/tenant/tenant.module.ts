import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { TenantResolver } from './tenant.resolver';
import { AuthModule } from '../../application/auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Tenant]), AuthModule],
  providers: [TenantService, TenantResolver],
  exports: [TenantService],
})
export class TenantModule {}
