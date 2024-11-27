import { CacheService } from '../../application/cache/cache.service';

export const getMockedCacheService = () => ({
  provide: CacheService,
  useValue: {
    insertOrUpdateCache: jest.fn(),
    getFromCache: jest.fn(),
    deleteOneFromCache: jest.fn(),
  },
});
