import { TestingModule } from '@nestjs/testing';
import { LandlordService } from './landlord.service';
import { createLandlordTestingModule } from './testConfig/landlord.test.config';

describe('LandlordService', () => {
  let service: LandlordService;

  beforeEach(async () => {
    const module: TestingModule = await createLandlordTestingModule();

    service = module.get<LandlordService>(LandlordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
