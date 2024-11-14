import { Test } from '@nestjs/testing';
import { Landlord } from '../entities/landlord.entity';
import { landlordModuleObject } from '../landlord.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { getMockedCacheProvider } from '../../../utils/unitTests/defaultCacheMock';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../application/user/entities/user.entity';
import { userModuleObject } from '../../../application/user/user.module';
import { clientModuleObject } from '../../../application/client/client.module';
import { Client } from '../../../application/client/entities/client.entity';
import { addressModuleObject } from '../../../application/address/address.module';
import { Address } from '../../../application/address/entities/address.entity';
import { SchedulerRegistry } from '@nestjs/schedule';

export const createLandlordTestingModule = async () =>
  await Test.createTestingModule({
    providers: [
      JwtService,
      SchedulerRegistry,
      ...landlordModuleObject.providers,
      ...userModuleObject.providers,
      ...clientModuleObject.providers,
      ...addressModuleObject.providers,
      getMockedEntityProvider(Landlord),
      getMockedEntityProvider(User),
      getMockedEntityProvider(Client),
      getMockedEntityProvider(Address),
      getMockedCacheProvider(),
    ],
  }).compile();
