import { TestingModule } from '@nestjs/testing';
import { DocumentRequirementResolver } from './document-requirement.resolver';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { getModelToken } from '@nestjs/sequelize';
import { createDocumentRequirementTestingModule } from './testConfig/document-requirement.test.config';
import { CreateDocumentRequirementInput } from './dto/create-document-requirement.input';
import { ERole } from '../../application/auth/role/role.enum';
import { DocumentType } from '../document-type/entities/document-type.entity';
import { validationPipe } from '../../application/pipes/validation.pipe';
import { UpdateDocumentRequirementInput } from './dto/update-document-requirement.input';

describe('DocumentRequirementResolver', () => {
  let resolver: DocumentRequirementResolver;
  let documentRequirementModel: typeof DocumentRequirement;
  let documentTypeModel: typeof DocumentType;

  beforeEach(async () => {
    const module: TestingModule =
      await createDocumentRequirementTestingModule();

    resolver = module.get<DocumentRequirementResolver>(
      DocumentRequirementResolver,
    );
    documentRequirementModel = module.get<typeof DocumentRequirement>(
      getModelToken(DocumentRequirement),
    );
    documentTypeModel = module.get<typeof DocumentType>(
      getModelToken(DocumentType),
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should add a document requirement', async () => {
    const dtoObj = {
      role: ERole.Tenant,
      documentTypeId: 1,
      reload: jest.fn(),
    };
    (documentTypeModel.findOne as jest.Mock).mockResolvedValueOnce({
      id: 1,
    });
    (documentRequirementModel.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      ...dtoObj,
    });

    const response = await resolver.createDocumentRequirement(dtoObj);
    expect(response).toEqual({ id: 1, ...dtoObj });
    expect(dtoObj.reload).toHaveBeenCalled();
  });

  it('should not add a document requirement without a documentTypeId', async () => {
    const dtoObj = {
      role: ERole.Tenant,
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: CreateDocumentRequirementInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty(
        'property',
        'documentTypeId',
      );
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isNotEmpty: 'documentTypeId should not be empty',
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should not create a document requirement if documentType entity does not exists', async () => {
    try {
      const dtoObj: CreateDocumentRequirementInput = {
        role: ERole.Tenant,
        documentTypeId: 1,
      };
      (documentRequirementModel.create as jest.Mock).mockResolvedValueOnce({
        id: 1,
        ...dtoObj,
      });

      await resolver.createDocumentRequirement(dtoObj);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        'Document type not found with provided documentTypeId',
      );
      expect(error.response).toHaveProperty('error', 'Not Found');
      expect(error.response).toHaveProperty('statusCode', 404);
    }
  });

  it('should not create a document requirement with an empty role', async () => {
    const dtoObj = {
      role: '',
      documentTypeId: 1,
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: CreateDocumentRequirementInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('property', 'role');
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isNotEmpty: 'role should not be empty',
        isValidDocumentOwnerRole: 'Inexistent document owner role: ',
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should not create a document requirement without a valid role', async () => {
    const dtoObj = {
      role: 'musician',
      documentTypeId: 1,
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: CreateDocumentRequirementInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('property', 'role');
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isValidDocumentOwnerRole: 'Inexistent document owner role: musician',
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should update a document requirement', async () => {
    const dtoObj: UpdateDocumentRequirementInput = {
      id: 1,
      role: ERole.Tenant,
      documentTypeId: 1,
    };
    const documentRequirementToUpdate: Partial<DocumentRequirement> = {
      id: 1,
      role: ERole.Admin,
      documentTypeId: 2,
      reload: jest.fn(),
    };

    (documentRequirementModel.findByPk as jest.Mock).mockResolvedValueOnce(
      documentRequirementToUpdate,
    );
    (documentTypeModel.findOne as jest.Mock).mockResolvedValueOnce({
      id: 1,
    });
    (documentRequirementModel.update as jest.Mock).mockImplementationOnce(
      () => {
        documentRequirementToUpdate.role = dtoObj.role;
        documentRequirementToUpdate.documentTypeId = dtoObj.documentTypeId;
      },
    );

    const response = await resolver.updateDocumentRequirement(dtoObj);
    expect(response).toEqual(expect.objectContaining(dtoObj));
    expect(documentRequirementToUpdate.reload).toHaveBeenCalled();
  });

  it('should not update a document requirement if it does not exists', async () => {
    try {
      const dtoObj: UpdateDocumentRequirementInput = {
        id: 1,
        role: ERole.Tenant,
      };
      await resolver.updateDocumentRequirement(dtoObj);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        'No document requirement found with provided id.',
      );
      expect(error.response).toHaveProperty('error', 'Not Found');
      expect(error.response).toHaveProperty('statusCode', 404);
    }
  });

  it('should not update a document requirement if documentType does not exists', async () => {
    try {
      const dtoObj: UpdateDocumentRequirementInput = {
        id: 1,
        role: ERole.Tenant,
        documentTypeId: 1,
      };
      (documentRequirementModel.findByPk as jest.Mock).mockResolvedValueOnce({
        id: 1,
      });

      await resolver.updateDocumentRequirement(dtoObj);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        'Document type not found with provided documentTypeId',
      );
      expect(error.response).toHaveProperty('error', 'Not Found');
      expect(error.response).toHaveProperty('statusCode', 404);
    }
  });

  it('should not update a document requirement with an empty role', async () => {
    const dtoObj: UpdateDocumentRequirementInput = {
      id: 1,
      role: '',
      documentTypeId: 1,
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: UpdateDocumentRequirementInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('property', 'role');
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isNotEmpty: 'role should not be empty',
        isValidDocumentOwnerRole: 'Inexistent document owner role: ',
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should not update a document requirement with an invalid role', async () => {
    const dtoObj: UpdateDocumentRequirementInput = {
      id: 1,
      role: 'musician',
    };

    try {
      await validationPipe.transform(dtoObj, {
        type: 'body',
        metatype: UpdateDocumentRequirementInput,
      });
    } catch (error) {
      expect(error.response).toHaveProperty('message');
      expect(error.response.message).toHaveLength(1);
      expect(error.response.message[0]).toHaveProperty('property', 'role');
      expect(error.response.message[0]).toHaveProperty('constraints', {
        isValidDocumentOwnerRole: 'Inexistent document owner role: musician',
      });
      expect(error.response).toHaveProperty('error', 'Bad Request');
    }
  });

  it('should get all document requirements', async () => {
    const documentRequirements = [
      {
        id: 1,
        role: ERole.Admin,
        documentTypeId: 1,
      },
    ];

    (documentRequirementModel.findAll as jest.Mock).mockResolvedValueOnce(
      documentRequirements,
    );
    const result = await resolver.findAll();
    expect(result).toEqual(documentRequirements);
  });

  it('should get one document requirement by id', async () => {
    const documentRequirement = {
      id: 1,
      role: ERole.Admin,
      documentTypeId: 1,
    };
    (documentRequirementModel.findByPk as jest.Mock).mockResolvedValueOnce(
      documentRequirement,
    );
    const result = await resolver.findOne(documentRequirement.id);
    expect(result).toEqual(documentRequirement);
  });

  it('should return undefined if document requirement does not exists', async () => {
    const documentRequirement = {
      id: 1,
      role: ERole.Admin,
      documentTypeId: 1,
    };
    const result = await resolver.findOne(documentRequirement.id);
    expect(result).toBeUndefined();
  });

  it('should remove a document requirement', async () => {
    (documentRequirementModel.findByPk as jest.Mock).mockResolvedValueOnce({
      id: 1,
    });
    const result = await resolver.removeDocumentRequirement(1);
    expect(result).toBeTruthy();
  });

  it('should throw if document requirement does not exists', async () => {
    try {
      await resolver.removeDocumentRequirement(1);
    } catch (error) {
      expect(error.response).toHaveProperty(
        'message',
        'No document requirement found with provided id.',
      );
      expect(error.response).toHaveProperty('error', 'Not Found');
      expect(error.response).toHaveProperty('statusCode', 404);
    }
  });
});
