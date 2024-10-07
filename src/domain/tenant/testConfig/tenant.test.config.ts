import { Test } from '@nestjs/testing';
import { tenantModuleObject } from '../tenant.module';
import { Tenant } from '../entities/tenant.entity';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { getMockedCacheProvider } from '../../../utils/unitTests/defaultCacheMock';
import { User } from '../../../application/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { userModuleObject } from '../../../application/user/user.module';

const tenantTestModuleObject = {
  providers: [
    JwtService,
    ...tenantModuleObject.providers,
    ...userModuleObject.providers,
    getMockedEntityProvider(Tenant),
    getMockedEntityProvider(User),
    getMockedCacheProvider(),
  ],
};

export const createTenantTestingModule = async () =>
  await Test.createTestingModule(tenantTestModuleObject).compile();
