import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { validationPipe } from '../../pipes/validation.pipe';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { Client } from '../entities/client.entity';
import { clientModuleObject } from '../client.module';
import { JwtService } from '@nestjs/jwt';
import { addressModuleObject } from '../../../application/address/address.module';
import { Address } from '../../../application/address/entities/address.entity';

const clientTestModuleObject = {
  providers: [
    JwtService,
    ...clientModuleObject.providers,
    ...addressModuleObject.providers,
    getMockedEntityProvider(Client),
    getMockedEntityProvider(Address),
    {
      provide: ValidationPipe,
      useValue: validationPipe,
    },
  ],
};

export const createClientTestingModule = async () =>
  await Test.createTestingModule(clientTestModuleObject).compile();
