import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, TenantModule],
})
export class AppModule {}
