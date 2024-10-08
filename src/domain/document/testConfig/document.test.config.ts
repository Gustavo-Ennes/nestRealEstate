import { Test } from '@nestjs/testing';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { getMockedCacheProvider } from '../../../utils/unitTests/defaultCacheMock';
import { JwtService } from '@nestjs/jwt';
import { Document } from '../entities/document.entity';
import { DocumentType } from '../../../domain/document-type/entities/document-type.entity';
import { documentModuleObject } from '../document.module';
import { documentTypeModuleObject } from '../../../domain/document-type/document-type.module';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { DocumentConsumer } from '../consumers/document.consumer';
import { APP_PIPE } from '@nestjs/core';
import { validationPipe } from '../../../application/pipes/validation.pipe';
import { ValidationPipe } from '@nestjs/common';
import { tenantModuleObject } from '../../../domain/tenant/tenant.module';
import { landlordModuleObject } from '../../../domain/landlord/landlord.module';
import { Tenant } from '../../../domain/tenant/entities/tenant.entity';
import { Landlord } from '../../../domain/landlord/entities/landlord.entity';

const documentTestModuleObject = {
  imports: [
    BullModule.registerQueue({
      name: 'document',
    }),
  ],
  providers: [
    JwtService,
    ...tenantModuleObject.providers,
    ...landlordModuleObject.providers,
    ...documentTypeModuleObject.providers,
    ...documentModuleObject.providers,
    getMockedEntityProvider(Tenant),
    getMockedEntityProvider(Landlord),
    getMockedEntityProvider(DocumentType),
    getMockedEntityProvider(Document),
    getMockedCacheProvider(),
    {
      provide: APP_PIPE,
      useValue: validationPipe,
    },
    {
      provide: ValidationPipe,
      useValue: validationPipe,
    },
  ],
};

export const createDocumentTestingModule = async () =>
  await Test.createTestingModule(documentTestModuleObject)
    .overrideProvider(getQueueToken('document'))
    .useValue({
      add: jest.fn(),
    })
    .overrideProvider(DocumentConsumer)
    .useValue({ process: jest.fn() })
    .compile();
