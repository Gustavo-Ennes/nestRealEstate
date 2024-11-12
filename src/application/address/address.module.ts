import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResolver } from './address.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address } from './entities/address.entity';
import { JwtModule } from '@nestjs/jwt';

export const addressModuleObject = {
  imports: [JwtModule, SequelizeModule.forFeature([Address])],
  providers: [AddressResolver, AddressService],
  exports: [AddressService],
};

@Module(addressModuleObject)
export class AddressModule {}
