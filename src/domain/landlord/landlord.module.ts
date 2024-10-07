import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LandlordService } from './landlord.service';
import { LandlordResolver } from './landlord.resolver';
import { Landlord } from './entities/landlord.entity';
import { AuthModule } from '../../application/auth/auth.module';

export const landlordModuleObject = {
  imports: [SequelizeModule.forFeature([Landlord]), AuthModule],
  providers: [LandlordResolver, LandlordService],
  exports: [LandlordService, SequelizeModule],
};

@Module(landlordModuleObject)
export class LandlordModule {}
