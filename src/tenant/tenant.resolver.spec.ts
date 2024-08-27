import { Test, TestingModule } from '@nestjs/testing';
import { TenantResolver } from './tenant.resolver';
import { TenantService } from './tenant.service';

describe('TenantResolver', () => {
  let resolver: TenantResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantResolver, TenantService],
    }).compile();

    resolver = module.get<TenantResolver>(TenantResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
