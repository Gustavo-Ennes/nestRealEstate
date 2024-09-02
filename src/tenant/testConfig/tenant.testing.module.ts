import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Tenant } from '../entities/tenant.entity';
import { TenantResolver } from '../tenant.resolver';
import { TenantService } from '../tenant.service';

export const createTenantTestingModule = async () =>
  await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret: process.env.JWT_SECRET,
      }),
    ],
    providers: [
      TenantService,
      TenantResolver,
      {
        provide: getModelToken(Tenant),
        useValue: {
          findAll: jest.fn(),
          findOne: jest.fn(),
          findByPk: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
      },
      {
        provide: CACHE_MANAGER,
        useValue: {
          get: jest.fn(),
          set: jest.fn(),
        } as Partial<Cache>,
      },
    ],
  }).compile();
