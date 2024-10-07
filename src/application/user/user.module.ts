import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

export const userModuleObject = {
  imports: [SequelizeModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
};

@Module(userModuleObject)
export class UserModule {}
