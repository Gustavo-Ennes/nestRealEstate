import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { User } from '../../user/entities/user.entity';
import { AuthResolver } from '../auth.resolver';
import { AuthService } from '../auth.service';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { Client } from '../../client/entities/client.entity';
import { userModuleObject } from '../../../application/user/user.module';
import { clientModuleObject } from '../../../application/client/client.module';
import { addressModuleObject } from '../../../application/address/address.module';
import { Address } from '../../../application/address/entities/address.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getMockedCacheService } from '../../../utils/unitTests/defaultCacheService';

const authTestModuleConfig = {
  imports: [
    JwtModule.register({
      secret: 'test',
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    SchedulerRegistry,
    ...userModuleObject.providers,
    ...clientModuleObject.providers,
    ...addressModuleObject.providers,
    getMockedEntityProvider(User),
    getMockedEntityProvider(Client),
    getMockedEntityProvider(Address),
    getMockedCacheService(),
  ],
};

export const createAuthTestModule = async () =>
  await Test.createTestingModule(authTestModuleConfig).compile();
