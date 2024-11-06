import { TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { createAuthTestModule } from './testConfig/auth.test.config';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await createAuthTestModule();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
