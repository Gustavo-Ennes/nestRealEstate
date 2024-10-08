import { TestingModule } from '@nestjs/testing';
import { DocumentResolver } from './document.resolver';
import { createDocumentTestingModule } from './testConfig/document.test.config';
import { getModelToken } from '@nestjs/sequelize';
import { DocumentType } from '../document-type/entities/document-type.entity';
import { EDocumentType } from './enum/document-type.enum';
import { FileUpload } from './document.interface';
import { Stream } from 'stream';
import { CreateDocumentInput } from './dto/create-document.input';
import { EOwnerType } from './enum/owner-type.enum';
import { assoc } from 'ramda';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UpdateDocumentInput } from './dto/update-document.input';
import { Document } from './entities/document.entity';
import { EDocumentStatus } from './enum/document-status.enum';
import { Tenant } from '../tenant/entities/tenant.entity';
import { validationPipe } from '../../application/pipes/validation.pipe';

describe('DocumentResolver', () => {
  let resolver: DocumentResolver,
    module: TestingModule,
    documentTypeModel: typeof DocumentType,
    documentModel: typeof Document,
    tenantModel: typeof Tenant,
    documentQueue: Queue;

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
  const documentDto: CreateDocumentInput = {
    ownerId: 1,
    ownerType: EOwnerType.Tenant,
    type: EDocumentType.IR,
    file: document,
  };

  const documentToUpdate = {
    id: 1,
    type: EDocumentType.Cpf,
    ownerType: EOwnerType.Tenant,
    ownerId: 1,
    status: EDocumentStatus.Processing,
    reload: jest.fn(),
  };

  beforeEach(async () => {
    module = await createDocumentTestingModule();

    resolver = module.get<DocumentResolver>(DocumentResolver);
    documentModel = module.get<typeof Document>(getModelToken(Document));
    documentTypeModel = module.get<typeof DocumentType>(
      getModelToken(DocumentType),
    );
    tenantModel = module.get<typeof Tenant>(getModelToken(Tenant));
    documentQueue = module.get<Queue>(getQueueToken('document'));

    (documentTypeModel.findAll as jest.Mock).mockResolvedValue([
      { name: EDocumentType.Cpf, applicableTo: 'natural' },
      { name: EDocumentType.CNPJ, applicableTo: 'legal' },
    ]);
    (documentModel.findOne as jest.Mock).mockResolvedValue(documentToUpdate);
    (documentQueue.add as jest.Mock).mockResolvedValue({ id: 1 });
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a document with a valid type', async () => {
    (tenantModel.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'name',
    });
    const dtoObj: CreateDocumentInput = assoc(
      'type',
      EDocumentType.Cpf,
      documentDto,
    );
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);
    const response = await resolver.createDocument(dtoInstance);
    expect(response).toEqual({ jobId: 1 });
  });

  it('should update a document with a valid type', async () => {
    (tenantModel.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'name',
    });
    const dtoObj: UpdateDocumentInput = {
      id: 1,
      type: EDocumentType.CNPJ,
    };

    const dtoInstance = Object.assign(new UpdateDocumentInput(), dtoObj);
    const response = await resolver.updateDocument(dtoInstance);
    expect(response).toEqual({ ...documentToUpdate, type: EDocumentType.Cpf });
  });

  it('should not create a document with an invalid type', async () => {
    const dtoObj: CreateDocumentInput = assoc(
      'type',
      // not mocked
      EDocumentType.Certificate,
      documentDto,
    );
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    try {
      await resolver.createDocument(dtoInstance);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        `${dtoInstance.type} isn't a valid type.`,
      );
      expect(error.response).toHaveProperty('error', `Bad Request`);
      expect(error.response).toHaveProperty('statusCode', 400);
    }
  });

  it('should not create a document with invalid owner type', async () => {
    const dtoObj: CreateDocumentInput = {
      ...documentDto,
      ownerType: 'bananasDePijamas',
      type: EDocumentType.CNPJ,
    };
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    try {
      await validationPipe.transform(dtoInstance, {
        type: 'body',
        metatype: CreateDocumentInput,
      });
    } catch (error) {
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isValidDocumentOwnerType: `Inexistent document owner type: ${dtoInstance.ownerType}`,
      });
      expect(error.response.message[0]).toHaveProperty('property', 'ownerType');
    }
  });

  it('should not create a document with inexistent owner entity', async () => {
    const dtoObj: CreateDocumentInput = assoc(
      'type',
      EDocumentType.Cpf,
      documentDto,
    );
    const dtoInstance = Object.assign(new CreateDocumentInput(), dtoObj);

    try {
      await resolver.createDocument(dtoInstance);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        `No ${dtoInstance.ownerType} found with provided id.`,
      );
      expect(error.response).toHaveProperty('error', `Bad Request`);
      expect(error.response).toHaveProperty('statusCode', 400);
    }
  });

  it('should not update a document with an invalid type', async () => {
    const dtoObj: UpdateDocumentInput = {
      id: 1,
      type: EDocumentType.Certificate,
    };
    const dtoInstance = Object.assign(new UpdateDocumentInput(), dtoObj);

    try {
      await resolver.updateDocument(dtoInstance);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        `${dtoInstance.type} isn't a valid type.`,
      );
      expect(error.response).toHaveProperty('error', `Bad Request`);
      expect(error.response).toHaveProperty('statusCode', 400);
    }
  });

  it('should not update a document with invalid owner type', async () => {
    const dtoObj: UpdateDocumentInput = {
      id: 1,
      ownerType: 'bananasDePijamas',
      type: EDocumentType.Cpf,
    };

    const dtoInstance = Object.assign(new UpdateDocumentInput(), dtoObj);

    try {
      await validationPipe.transform(dtoInstance, {
        type: 'body',
        metatype: UpdateDocumentInput,
      });
    } catch (error) {
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isValidDocumentOwnerType: `Inexistent document owner type: ${dtoInstance.ownerType}`,
      });
      expect(error.response.message[0]).toHaveProperty('property', 'ownerType');
    }
  });

  it('should not update a document with inexistent owner entity', async () => {
    const dtoObj: UpdateDocumentInput = {
      id: 1,
      ownerType: EOwnerType.Tenant,
    };

    const dtoInstance = Object.assign(new UpdateDocumentInput(), dtoObj);

    try {
      await resolver.updateDocument(dtoInstance);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        `${dtoInstance.ownerType} isn't a valid owner type.`,
      );
      expect(error.response).toHaveProperty('error', `Bad Request`);
      expect(error.response).toHaveProperty('statusCode', 400);
    }
  });
});
