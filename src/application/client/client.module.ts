import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientResolver } from './client.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Client } from './entities/client.entity';
import { JwtModule } from '@nestjs/jwt';
import { AddressModule } from '../address/address.module';

export const clientModuleObject = {
  imports: [SequelizeModule.forFeature([Client]), JwtModule, AddressModule],
  providers: [ClientResolver, ClientService],
  exports: [ClientService],
};

@Module(clientModuleObject)
export class ClientModule {}
