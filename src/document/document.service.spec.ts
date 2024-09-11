import { Test, TestingModule } from '@nestjs/testing';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { DocumentService } from './document.service';
import { Document } from './entities/document.entity';
import { Stream } from 'stream';
import { FileUpload } from './document.interface';
import { CreateDocumentInput } from './dto/create-document.input';
import { Queue } from 'bullmq';
import { EDocumentType } from './enum/document-type.enum';
import { EOwnerType } from './enum/owner-type.enum';
import { assoc, dissoc } from 'ramda';
import { validate } from 'class-validator';

describe('DocumentService', () => {
  let service: DocumentService, module: TestingModule, documentQueue: Queue;
  const document: Promise<FileUpload> = Promise.resolve({
    filename: 'file',
    mimetype: 'mimetype',
    encoding: 'utf-8',
    createReadStream: () => {
      const stream = new Stream.PassThrough();
      process.nextTick(() => {
        stream.write('test data');
        stream.end();
      });
      return stream;
    },
  });
  const documentInfo: CreateDocumentInput = {
    ownerId: 1,
    ownerType: EOwnerType.Tenant,
    type: EDocumentType.IR,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'document',
        }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
        }),
      ],
      providers: [
        DocumentService,
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
    })
      .overrideProvider(getQueueToken('document'))
      .useValue({
        add: jest.fn(),
      })
      .compile();

    service = module.get<DocumentService>(DocumentService);
    documentQueue = module.get<Queue>(getQueueToken('document'));
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a document', async () => {
    (documentQueue.add as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const response = await service.create(document, documentInfo);

    expect(documentQueue.add).toHaveBeenCalledWith(
      'uploadAndSave',
      expect.objectContaining({
        tempFilePath: expect.any(String),
        documentInfo,
      }),
      { attempts: 3 },
    );
    expect(response.jobId).toBeDefined();
  });

  it('should create a document with observation', async () => {
    (documentQueue.add as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const documentInfoWithObservation = assoc(
      'observation',
      'someObservation',
      documentInfo,
    );
    const response = await service.create(
      document,
      documentInfoWithObservation,
    );

    expect(documentQueue.add).toHaveBeenCalledWith(
      'uploadAndSave',
      expect.objectContaining({
        tempFilePath: expect.any(String),
        documentInfo: documentInfoWithObservation,
      }),
      { attempts: 3 },
    );
    expect(response.jobId).toBeDefined();
  });

  it('should not create a document if type is missing', async () => {
    const dtoObj = dissoc('type', documentInfo);
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('type');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'type should not be empty',
    );
  });
  it('should not create a document if ownerType is missing', async () => {
    const dtoObj = dissoc('ownerType', documentInfo);
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('ownerType');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'ownerType should not be empty',
    );
  });
  it('should not create a document if ownerId is missing', async () => {
    const dtoObj = dissoc('ownerId', documentInfo);
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('ownerId');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isNotEmpty',
      'ownerId should not be empty',
    );
  });
  it('should not create a document if type is invalid', async () => {
    const dtoObj = assoc('type', 'police officer', documentInfo);
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('type');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isValidDocumentType',
      `Inexistent document type: ${dtoObj.type}`,
    );
  });
  it('should not create a document if ownerType is invalid', async () => {
    const dtoObj = assoc('ownerType', 'police officer', documentInfo);
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    const dtoValidation = await validate(dtoInstance);

    expect(dtoValidation).toBeInstanceOf(Array);
    expect(dtoValidation).toHaveLength(1);
    expect(dtoValidation[0].property).toBe('ownerType');
    expect(dtoValidation[0].constraints).toHaveProperty(
      'isValidDocumentOwnerType',
      `Inexistent document owner type: ${dtoObj.ownerType}`,
    );});
});
