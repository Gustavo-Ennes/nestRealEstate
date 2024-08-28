import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule, TenantModule, AuthModule, UserModule],
})
export class AppModule {}
