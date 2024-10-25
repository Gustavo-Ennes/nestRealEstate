import { TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { createClientTestingModule } from './testConfig/client.test.config';

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await createClientTestingModule();

    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
