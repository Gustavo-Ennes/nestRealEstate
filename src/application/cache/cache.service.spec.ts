import { TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { getModelToken } from '@nestjs/sequelize';
import { createCacheTestingModule } from './testConfig/cache.test.config';
import { DocumentType } from '../../domain/document-type/entities/document-type.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { dissoc } from 'ramda';
import { ModuleNames } from './cache.utils';

describe('CacheService', () => {
  let module: TestingModule;
  let service: CacheService;
  let cache: Cache;
  let documentTypeModel: typeof DocumentType;
  const documentTypes = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

  beforeEach(async () => {
    module = await createCacheTestingModule();

    service = module.get<CacheService>(CacheService);
    cache = module.get<Cache>(CACHE_MANAGER);
    documentTypeModel = module.get<typeof DocumentType>(
      getModelToken(DocumentType),
    );
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should insert into cache', async () => {
    const newDocumentType = { id: 6 };
    const allDocumentTypes = [...documentTypes, newDocumentType];

    (documentTypeModel.findAll as jest.Mock).mockResolvedValueOnce(
      allDocumentTypes,
    );

    await service.insertOrUpdateCache({
      moduleName: ModuleNames.DocumentType,
      createdOrUpdated: newDocumentType as DocumentType,
      allEntities: allDocumentTypes as DocumentType[],
    });

    const individualFromCache = await cache.get('documentType:6');
    const allFromCache = await cache.get('documentTypes');

    expect(individualFromCache).toHaveProperty('id', 6);
    expect(allFromCache).toHaveLength(6);
    expect(allFromCache).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
        expect.objectContaining({ id: 3 }),
        expect.objectContaining({ id: 4 }),
        expect.objectContaining({ id: 5 }),
        expect.objectContaining({ id: 6 }),
      ]),
    );
  });

  it('should update the cache', async () => {
    const updatedDocumentType = { id: 5, name: 'has name' };
    const allDocumentTypes = [...dissoc(4, documentTypes), updatedDocumentType];

    (documentTypeModel.findAll as jest.Mock).mockResolvedValueOnce(
      allDocumentTypes,
    );
    await service.insertOrUpdateCache({
      moduleName: ModuleNames.DocumentType,
      createdOrUpdated: updatedDocumentType as DocumentType,
      allEntities: allDocumentTypes as DocumentType[],
    });

    const individualFromCache = await cache.get('documentType:5');
    const allFromCache = await cache.get('documentTypes');

    expect(individualFromCache).toHaveProperty('id', updatedDocumentType.id);
    expect(individualFromCache).toHaveProperty(
      'name',
      updatedDocumentType.name,
    );
    expect(allFromCache).toHaveLength(5);
    expect(allFromCache).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
        expect.objectContaining({ id: 3 }),
        expect.objectContaining({ id: 4 }),
        expect.objectContaining(updatedDocumentType),
      ]),
    );
  });

  it('should get documentTypes from cache', async () => {
    const documentType = { id: 66 };
    const allDocumentTypes = [documentType];

    await cache.set('documentTypes', allDocumentTypes);
    await cache.set('documentType:66', documentType);

    const documentFromCache = await service.getFromCache<DocumentType>(
      ModuleNames.DocumentType,
      documentType.id,
    );
    const allDocumentsFromCache = await service.getFromCache<DocumentType>(
      ModuleNames.DocumentType,
    );

    expect(documentFromCache).toHaveProperty('id', documentType.id);
    expect(allDocumentsFromCache).toHaveLength(1);
    expect(allDocumentsFromCache).toEqual(
      expect.arrayContaining([expect.objectContaining(documentType)]),
    );
  });

  it('should delete one from cache(individual key)', async () => {
    const documentType = { id: 66 };
    const allDocumentTypes = [documentType];

    await cache.set('documentTypes', allDocumentTypes);
    await cache.set('documentType:66', documentType);

    await service.deleteOneFromCache(ModuleNames.DocumentType, documentType.id);

    const documentTypeFromCache = cache.get(`documentType:${documentType.id}`);
    expect(documentTypeFromCache).toMatchObject({});
  });

  it('should invalidate all cache from an entity', async () => {
    const documentType = { id: 66 };
    const allDocumentTypes = [documentType];

    await cache.set('documentTypes', allDocumentTypes);
    await cache.set('documentType:66', documentType);

    await service.invalidateCache(ModuleNames.DocumentType, documentType.id);

    const documentTypeFromCache = cache.get(`documentType:${documentType.id}`);
    const allFromCache = cache.get('documentTypes');

    expect(documentTypeFromCache).toMatchObject({});
    expect(allFromCache).toMatchObject({});
  });
});
