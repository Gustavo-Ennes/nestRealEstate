import { TestingModule } from '@nestjs/testing';
import { DocumentRequirementService } from './document-requirement.service';
import { createDocumentRequirementTestingModule } from './testConfig/document-requirement.test.config';

describe('DocumentRequirementService', () => {
  let service: DocumentRequirementService;

  beforeEach(async () => {
    const module: TestingModule =
      await createDocumentRequirementTestingModule();

    service = module.get<DocumentRequirementService>(
      DocumentRequirementService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
