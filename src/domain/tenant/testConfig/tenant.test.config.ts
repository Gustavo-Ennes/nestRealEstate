import { Test } from '@nestjs/testing';
import { tenantModuleObject } from '../tenant.module';
import { Tenant } from '../entities/tenant.entity';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { getMockedCacheProvider } from '../../../utils/unitTests/defaultCacheMock';
import { User } from '../../../application/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { userModuleObject } from '../../../application/user/user.module';
import { clientModuleObject } from '../../../application/client/client.module';
import { Client } from '../../../application/client/entities/client.entity';
import { addressModuleObject } from '../../../application/address/address.module';
import { Address } from '../../../application/address/entities/address.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getMockedCacheService } from '../../../utils/unitTests/defaultCacheService';

const tenantTestModuleObject = {
  providers: [
    JwtService,
    SchedulerRegistry,
    ...tenantModuleObject.providers,
    ...userModuleObject.providers,
    ...clientModuleObject.providers,
    ...addressModuleObject.providers,
    getMockedEntityProvider(Tenant),
    getMockedEntityProvider(User),
    getMockedEntityProvider(Client),
    getMockedEntityProvider(Address),
    getMockedCacheProvider(),
    getMockedCacheService(),
  ],
};

export const createTenantTestingModule = async () =>
  await Test.createTestingModule(tenantTestModuleObject).compile();
