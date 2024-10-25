import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validationPipe } from '../../pipes/validation.pipe';
import { userModuleObject } from '../../user/user.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { Client } from '../entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { clientModuleObject } from '../client.module';
import { JwtService } from '@nestjs/jwt';

const clientTestModuleObject = {
  providers: [
    JwtService,
    ...clientModuleObject.providers,
    ...userModuleObject.providers,
    getMockedEntityProvider(Client),
    getMockedEntityProvider(User),
    {
      provide: ValidationPipe,
      useValue: validationPipe,
    },
  ],
};

export const createClientTestingModule = async () =>
  await Test.createTestingModule(clientTestModuleObject).compile();
