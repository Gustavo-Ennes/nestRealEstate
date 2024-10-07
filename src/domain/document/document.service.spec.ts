import { getQueueToken } from '@nestjs/bullmq';
import { DocumentService } from './document.service';
import { Stream } from 'stream';
import { FileUpload } from './document.interface';
import { CreateDocumentInput } from './dto/create-document.input';
import { Queue } from 'bullmq';
import { EDocumentType } from './enum/document-type.enum';
import { EOwnerType } from './enum/owner-type.enum';
import { assoc } from 'ramda';
import { createDocumentTestingModule } from './testConfig/document.test.config';
import { TestingModule } from '@nestjs/testing';

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
    file: document,
  };

  beforeEach(async () => {
    module = await createDocumentTestingModule();

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
    const response = await service.create(documentInfo);

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
    const response = await service.create(documentInfoWithObservation);

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

  // see e2e tests for dto validation
});
