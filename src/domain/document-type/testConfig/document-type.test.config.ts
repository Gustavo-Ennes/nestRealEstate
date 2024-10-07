import { Test } from '@nestjs/testing';
import { DocumentType } from '../entities/document-type.entity';
import { documentTypeModuleObject } from '../document-type.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { authModuleObject } from '../../../application/auth/auth.module';
import { userModuleObject } from '../../../application/user/user.module';
import { User } from '../../../application/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

export const documentTypeTestModuleObject = {
  providers: [
    JwtService,
    ...documentTypeModuleObject.providers,
    ...authModuleObject.providers,
    ...userModuleObject.providers,
    getMockedEntityProvider(DocumentType),
    getMockedEntityProvider(User),
  ],
};
export const createDocumentTypeTestingModule = async () =>
  await Test.createTestingModule(documentTypeTestModuleObject).compile();
