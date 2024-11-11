import { TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { createAddressTestingModule } from './testConfig/address.test.config';

describe('AddressService', () => {
  let service: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await createAddressTestingModule();

    service = module.get<AddressService>(AddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
