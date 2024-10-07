import { CACHE_MANAGER } from '@nestjs/cache-manager';

export function getMockedCacheProvider() {
  return {
    provide: CACHE_MANAGER,
    useValue: {
      get: jest.fn(),
      set: jest.fn(),
    } as Partial<Cache>,
  };
}
