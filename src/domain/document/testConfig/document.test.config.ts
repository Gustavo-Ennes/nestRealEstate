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

const documentTestModuleObject = {
  imports: [
    BullModule.registerQueue({
      name: 'document',
    }),
  ],
  providers: [
    JwtService,
    ...documentTypeModuleObject.providers,
    ...documentModuleObject.providers,
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
