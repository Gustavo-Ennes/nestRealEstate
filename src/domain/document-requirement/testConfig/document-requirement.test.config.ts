import { Test } from '@nestjs/testing';
import { DocumentRequirement } from '../entities/document-requirement.entity';
import { documentRequirementModuleObject } from '../document-requirement.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { DocumentType } from '../../document-type/entities/document-type.entity';
import { JwtService } from '@nestjs/jwt';
import { documentTypeModuleObject } from '../../document-type/document-type.module';

export const documentRequirementTestModuleObject = {
  providers: [
    JwtService,
    ...documentTypeModuleObject.providers,
    ...documentRequirementModuleObject.providers,
    getMockedEntityProvider(DocumentType),
    getMockedEntityProvider(DocumentRequirement),
  ],
};

export const createDocumentRequirementTestingModule = async () =>
  await Test.createTestingModule(documentRequirementTestModuleObject).compile();