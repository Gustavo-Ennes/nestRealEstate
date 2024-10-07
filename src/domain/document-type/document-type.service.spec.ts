import { TestingModule } from '@nestjs/testing';
import { DocumentTypeService } from './document-type.service';
import { createDocumentTypeTestingModule } from './testConfig/document-type.test.config';

describe('DocumentTypeService', () => {
  let service: DocumentTypeService;

  beforeEach(async () => {
    const module: TestingModule = await createDocumentTypeTestingModule();

    service = module.get<DocumentTypeService>(DocumentTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
