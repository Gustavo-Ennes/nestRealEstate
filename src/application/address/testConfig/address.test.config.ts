import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { addressModuleObject } from '../address.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { Address } from '../entities/address.entity';
import { validationPipe } from '../../../application/pipes/validation.pipe';
import { JwtService } from '@nestjs/jwt';
import { SchedulerRegistry } from '@nestjs/schedule';

export const addressTestConfigObject = {
  providers: [
    JwtService,
    SchedulerRegistry,
    ...addressModuleObject.providers,
    getMockedEntityProvider(Address),
    {
      provide: ValidationPipe,
      useValue: validationPipe,
    },
  ],
};

export const createAddressTestingModule = async () =>
  await Test.createTestingModule(addressTestConfigObject).compile();
