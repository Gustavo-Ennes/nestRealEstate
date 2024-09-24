import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BucketModule } from './bucket/bucket.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, AuthModule, UserModule, BucketModule],
})
export class ApplicationModule {}
