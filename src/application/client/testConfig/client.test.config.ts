import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validationPipe } from '../../pipes/validation.pipe';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { Client } from '../entities/client.entity';
import { clientModuleObject } from '../client.module';
import { JwtService } from '@nestjs/jwt';

const clientTestModuleObject = {
  providers: [
    JwtService,
    ...clientModuleObject.providers,
    getMockedEntityProvider(Client),
    {
      provide: ValidationPipe,
      useValue: validationPipe,
    },
  ],
};

export const createClientTestingModule = async () =>
  await Test.createTestingModule(clientTestModuleObject).compile();
