import { Test, TestingModule } from '@nestjs/testing';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
import { BucketModule } from '../../application/bucket/bucket.module';
import { DocumentConsumer } from './consumers/document.consumer';
import { BullModule } from '@nestjs/bullmq';
import { Document } from './entities/document.entity';
import { getModelToken } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

describe('DocumentResolver', () => {
  let resolver: DocumentResolver, module: TestingModule;

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

    resolver = module.get<DocumentResolver>(DocumentResolver);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
