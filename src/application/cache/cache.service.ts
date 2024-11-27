import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Model } from 'sequelize-typescript';
import { getSingleMappedKeys, ModuleNames } from './cache.utils';

type InserOrUpdateCacheParam = {
  moduleName: ModuleNames;
  createdOrUpdated?: Model | undefined;
  allEntities?: Model[] | undefined;
};

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async insertOrUpdateCache({
    moduleName,
    createdOrUpdated,
    allEntities,
  }: InserOrUpdateCacheParam) {
    try {
      const { all, individual } = getSingleMappedKeys(
        moduleName,
        createdOrUpdated?.id,
      );

      if (individual)
        await this.cacheManager.set(individual, createdOrUpdated, 3600);

      if (allEntities) await this.cacheManager.set(all, allEntities, 3600);

      return { success: true };
    } catch (error) {
      console.error('Cache update failed', error);
      return { success: false, error };
    }
  }

  async getFromCache<TEntity extends Model>(
    moduleName: ModuleNames,
    id?: number,
  ): Promise<TEntity | TEntity[] | null> {
    const { all, individual } = getSingleMappedKeys(moduleName, id);

    if (id) {
      return await this.cacheManager.get(individual);
    }

    return await this.cacheManager.get(all);
  }

  async deleteOneFromCache(moduleName: ModuleNames, id: number) {
    const { individual } = getSingleMappedKeys(moduleName, id);
    await this.cacheManager.del(individual);
  }

  async invalidateCache(moduleName: ModuleNames, id?: number) {
    const { all, individual } = getSingleMappedKeys(moduleName, id);

    if (id && individual) {
      await this.cacheManager.del(individual);
    }

    await this.cacheManager.del(all);
  }
}
