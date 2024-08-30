import { TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { createTenantTestingModule } from './testConfig/tenant.testing.module';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await createTenantTestingModule();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
