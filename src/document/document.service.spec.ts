import { Test, TestingModule } from '@nestjs/testing';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { DocumentService } from './document.service';
import { BucketModule } from '../bucket/bucket.module';
import { DocumentConsumer } from './consumers/document.consumer';
import { DocumentResolver } from './document.resolver';
import { Document } from './entities/document.entity';

describe('DocumentService', () => {
  let service: DocumentService, module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        BucketModule,
        BullModule.registerQueue({
          name: 'document',
        }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
        }),
      ],
      providers: [
        DocumentResolver,
        DocumentService,
        {
          provide: DocumentConsumer,
          useValue: {
            process: jest.fn(),
          },
        },
        {
          provide: getModelToken(Document),
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByPk: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
