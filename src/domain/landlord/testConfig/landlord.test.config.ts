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

export const createLandlordTestingModule = async () =>
  await Test.createTestingModule({
    providers: [
      JwtService,
      ...landlordModuleObject.providers,
      ...userModuleObject.providers,
      ...clientModuleObject.providers,
      getMockedEntityProvider(Landlord),
      getMockedEntityProvider(User),
      getMockedEntityProvider(Client),
      getMockedCacheProvider(),
    ],
  }).compile();
