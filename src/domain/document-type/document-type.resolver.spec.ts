import { TestingModule } from '@nestjs/testing';
import { DocumentTypeResolver } from './document-type.resolver';
import { createDocumentTypeTestingModule } from './testConfig/document-type.test.config';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { EActorType } from '../enum/actor-type.enum';
import { getModelToken } from '@nestjs/sequelize';
import { validationPipe } from '../../application/pipes/validation.pipe';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';

describe('DocumentTypeResolver', () => {
  let resolver: DocumentTypeResolver, documentTypeModel: typeof DocumentType;

  beforeEach(async () => {
    const module: TestingModule = await createDocumentTypeTestingModule();

    resolver = module.get<DocumentTypeResolver>(DocumentTypeResolver);
    documentTypeModel = module.get<typeof DocumentType>(
      getModelToken(DocumentType),
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a document type', async () => {
    const dtoObj: CreateDocumentTypeInput = {
      name: 'asdasd',
      applicableTo: EActorType.Natural,
    };
    (documentTypeModel.create as jest.Mock).mockResolvedValueOnce({
      ...dtoObj,
      id: 1,
    });
    const dtoInstance = Object.assign(new CreateDocumentTypeInput(), dtoObj);
    const response = await resolver.createDocumentType(dtoInstance);
    expect(response).toEqual({ id: 1, ...dtoInstance });
  });

  it('should not create a document type without a name', async () => {
    const dtoObj = {
      applicableTo: EActorType.Legal,
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: CreateDocumentTypeInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('property', 'name');
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isNotEmpty: 'name should not be empty',
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should not create a document type without a applicableTo property', async () => {
    const dtoObj = {
      name: 'gustavo',
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: CreateDocumentTypeInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty(
        'property',
        'applicableTo',
      );
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isNotEmpty: 'applicableTo should not be empty',
        isActorType: "undefined isn't a valid actor type.",
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should not create a document type with invalid applicableTo property', async () => {
    const dtoObj: CreateDocumentTypeInput = {
      name: 'asdasd',
      applicableTo: 'musical',
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: CreateDocumentTypeInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty(
        'property',
        'applicableTo',
      );
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isActorType: `${dtoObj.applicableTo} isn't a valid actor type.`,
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should update a document type', async () => {
    const documentTypeToUpdate = {
      nome: 'name',
      applicableTo: EActorType.Legal,
      id: 1,
      reload: jest.fn(),
    };
    const dtoObj: UpdateDocumentTypeInput = {
      id: 1,
      applicableTo: EActorType.Natural,
    };

    (documentTypeModel.findOne as jest.Mock).mockResolvedValueOnce(
      documentTypeToUpdate,
    );
    (documentTypeModel.update as jest.Mock).mockResolvedValueOnce({
      ...documentTypeToUpdate,
      applicableTo: EActorType.Natural,
    });

    const dtoInstance = Object.assign(new UpdateDocumentTypeInput(), dtoObj);
    const response = await resolver.updateDocumentType(dtoInstance);
    expect(response).toEqual({
      ...documentTypeToUpdate,
      applicableTo: EActorType.Natural,
    });
    expect(documentTypeToUpdate.reload).toHaveBeenCalled();
  });
  it('should not update a document type with a empty name', async () => {
    const dtoObj: UpdateDocumentTypeInput = {
      id: 1,
      name: '',
    };
    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: UpdateDocumentTypeInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('property', 'name');
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isNotEmpty: `name should not be empty`,
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should not update a document type with a empty applicableTo', async () => {
    const dtoObj: UpdateDocumentTypeInput = {
      id: 1,
      applicableTo: '',
    };
    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: UpdateDocumentTypeInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty(
        'property',
        'applicableTo',
      );
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isNotEmpty: `applicableTo should not be empty`,
        isActorType: " isn't a valid actor type.",
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should not update a document type with invalid applicableTo property', async () => {
    const dtoObj: UpdateDocumentTypeInput = {
      id: 1,
      applicableTo: 'musical',
    };
    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: UpdateDocumentTypeInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty(
        'property',
        'applicableTo',
      );
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isActorType: "musical isn't a valid actor type.",
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should get all the document types', async () => {
    const documentTypes = [{ id: 1 }, { id: 2 }];
    (documentTypeModel.findAll as jest.Mock).mockResolvedValueOnce(
      documentTypes,
    );

    const response = await resolver.findAll();
    expect(response).toEqual(documentTypes);
  });

  it('should get a document type by id', async () => {
    const documentType = { id: 1 };
    (documentTypeModel.findOne as jest.Mock).mockResolvedValueOnce(
      documentType,
    );

    const response = await resolver.findOne(documentType.id);
    expect(response).toEqual(documentType);
  });

  it('should return null if no document type found', async () => {
    (documentTypeModel.findOne as jest.Mock).mockResolvedValueOnce(null);

    const response = await resolver.findOne(1);
    expect(response).toBeNull();
  });

  it('should delete a document type', async () => {
    const documentType = { id: 1, destroy: jest.fn() };
    (documentTypeModel.findOne as jest.Mock).mockResolvedValueOnce(
      documentType,
    );

    const response = await resolver.removeDocumentType(documentType.id);
    expect(response).toBeTruthy();
    expect(documentType.destroy).toHaveBeenCalled();
  });

  it('should do nothing if no document type exists to delete', async () => {
    try {
      await resolver.removeDocumentType(1);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        'DocumentType not found for document id 1',
      );
      expect(error.response).toHaveProperty('error', 'Not Found');
      expect(error.response).toHaveProperty('statusCode', 404);
    }
  });
});
