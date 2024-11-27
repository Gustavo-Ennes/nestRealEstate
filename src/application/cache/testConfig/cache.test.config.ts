import { Test } from '@nestjs/testing';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { SchedulerRegistry } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { clientModuleObject } from '../../client/client.module';
import { Client } from '../../client/entities/client.entity';
import { documentTypeModuleObject } from '../../../domain/document-type/document-type.module';
import { documentModuleObject } from '../../../domain/document/document.module';
import { Landlord } from '../../../domain/landlord/entities/landlord.entity';
import { landlordModuleObject } from '../../../domain/landlord/landlord.module';
import { Tenant } from '../../../domain/tenant/entities/tenant.entity';
import { tenantModuleObject } from '../../../domain/tenant/tenant.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { Document } from '../../../domain/document/entities/document.entity';
import { DocumentType } from '../../../domain/document-type/entities/document-type.entity';
import { documentRequirementModuleObject } from '../../../domain/document-requirement/document-requirement.module';
import { DocumentRequirement } from '../../../domain/document-requirement/entities/document-requirement.entity';
import { addressModuleObject } from '../../../application/address/address.module';
import { Address } from '../../../application/address/entities/address.entity';
import { BucketService } from '../../../application/bucket/bucket.service';
import { CacheService } from '../cache.service';

const cacheTestModuleObject = {
  imports: [
    CacheModule.register({
      store: 'memory',
      max: 100,
      ttl: 60 * 1000,
    }),
    BullModule.registerQueue({
      name: 'document',
    }),
  ],
  providers: [
    CacheService,
    ...tenantModuleObject.providers,
    ...landlordModuleObject.providers,
    ...documentTypeModuleObject.providers,
    ...documentModuleObject.providers,
    ...documentRequirementModuleObject.providers,
    ...clientModuleObject.providers,
    ...addressModuleObject.providers,
    BucketService,
    SchedulerRegistry,
    JwtService,
    getMockedEntityProvider(Tenant),
    getMockedEntityProvider(Landlord),
    getMockedEntityProvider(DocumentType),
    getMockedEntityProvider(Document),
    getMockedEntityProvider(DocumentRequirement),
    getMockedEntityProvider(Client),
    getMockedEntityProvider(Address),
  ],
};

export const createCacheTestingModule = async () =>
  await Test.createTestingModule(cacheTestModuleObject).compile();
