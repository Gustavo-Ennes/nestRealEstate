import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LandlordService } from './landlord.service';
import { LandlordResolver } from './landlord.resolver';
import { Landlord } from './entities/landlord.entity';
import { AuthModule } from '../../application/auth/auth.module';
import { ClientModule } from '../../application/client/client.module';
import { AddressModule } from '../../application/address/address.module';
import { CacheModule } from '../../application/cache/cache.module';

export const landlordModuleObject = {
  imports: [
    SequelizeModule.forFeature([Landlord]),
    AuthModule,
    ClientModule,
    AddressModule,
    CacheModule,
  ],
  providers: [LandlordResolver, LandlordService],
  exports: [LandlordService, SequelizeModule],
};

@Module(landlordModuleObject)
export class LandlordModule {}
