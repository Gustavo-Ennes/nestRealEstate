import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DocumentModule } from './document/document.module';
import { BucketModule } from './bucket/bucket.module';

@Module({
  imports: [
    ConfigModule,
    TenantModule,
    AuthModule,
    UserModule,
    DocumentModule,
    BucketModule,
  ],
})
export class AppModule {}
