import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { User } from '../../user/entities/user.entity';
import { AuthResolver } from '../auth.resolver';
import { AuthService } from '../auth.service';
import { getMockedEntityProvider } from '../../../utils/unitTests/defaultEntityMock';
import { Client } from '../../client/entities/client.entity';
import { userModuleObject } from '../../../application/user/user.module';
import { clientModuleObject } from '../../../application/client/client.module';

const authTestModuleConfig = {
  imports: [
    JwtModule.register({
      secret: 'test',
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    ...userModuleObject.providers,
    ...clientModuleObject.providers,
    getMockedEntityProvider(User),
    getMockedEntityProvider(Client),
  ],
};

export const createAuthTestModule = async () =>
  await Test.createTestingModule(authTestModuleConfig).compile();
