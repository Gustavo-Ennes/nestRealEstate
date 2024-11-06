import { Test } from '@nestjs/testing';
import { DocumentType } from '../entities/document-type.entity';
import { documentTypeModuleObject } from '../document-type.module';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { authModuleObject } from '../../../application/auth/auth.module';
import { userModuleObject } from '../../../application/user/user.module';
import { User } from '../../../application/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Client } from '../../../application/client/entities/client.entity';
import { clientModuleObject } from '../../../application/client/client.module';

export const documentTypeTestModuleObject = {
  providers: [
    JwtService,
    ...documentTypeModuleObject.providers,
    ...authModuleObject.providers,
    ...userModuleObject.providers,
    ...clientModuleObject.providers,
    getMockedEntityProvider(DocumentType),
    getMockedEntityProvider(User),
    getMockedEntityProvider(Client),
  ],
};
export const createDocumentTypeTestingModule = async () =>
  await Test.createTestingModule(documentTypeTestModuleObject).compile();
