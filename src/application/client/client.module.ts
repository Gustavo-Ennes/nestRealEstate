import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientResolver } from './client.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Client } from './entities/client.entity';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

export const clientModuleObject = {
  imports: [SequelizeModule.forFeature([Client]), UserModule, JwtModule],
  providers: [ClientResolver, ClientService],
};

@Module(clientModuleObject)
export class ClientModule {}
