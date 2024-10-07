import { TestingModule } from '@nestjs/testing';
import { DocumentTypeResolver } from './document-type.resolver';
import { createDocumentTypeTestingModule } from './testConfig/document-type.test.config';

describe('DocumentTypeResolver', () => {
  let resolver: DocumentTypeResolver;

  beforeEach(async () => {
    const module: TestingModule = await createDocumentTypeTestingModule();

    resolver = module.get<DocumentTypeResolver>(DocumentTypeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
