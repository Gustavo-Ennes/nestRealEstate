import { Test } from '@nestjs/testing';
import { DocumentType } from '../entities/document-type.entity';
import { documentTypeModuleObject } from '../document-type.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { authModuleObject } from '../../../application/auth/auth.module';
import { userModuleObject } from '../../../application/user/user.module';
import { User } from '../../../application/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Client } from '../../../application/client/entities/client.entity';
import { clientModuleObject } from '../../../application/client/client.module';
import { addressModuleObject } from '../../../application/address/address.module';
import { Address } from '../../../application/address/entities/address.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { getMockedCacheService } from '../../../utils/unitTests/defaultCacheService';
import { getMockedCacheProvider } from '../../../utils/unitTests/defaultCacheMock';

export const documentTypeTestModuleObject = {
  providers: [
    JwtService,
    SchedulerRegistry,
    ...documentTypeModuleObject.providers,
    ...authModuleObject.providers,
    ...userModuleObject.providers,
    ...clientModuleObject.providers,
    ...addressModuleObject.providers,
    getMockedEntityProvider(DocumentType),
    getMockedEntityProvider(User),
    getMockedEntityProvider(Client),
    getMockedEntityProvider(Address),
    getMockedCacheProvider(),
    getMockedCacheService(),
  ],
};
export const createDocumentTypeTestingModule = async () =>
  await Test.createTestingModule(documentTypeTestModuleObject).compile();
