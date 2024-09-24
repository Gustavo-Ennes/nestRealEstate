import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Landlord } from '../entities/landlord.entity';
import { LandlordResolver } from '../landlord.resolver';
import { LandlordService } from '../landlord.service';

export const createLandlordTestingModule = async () =>
  await Test.createTestingModule({
    imports: [
      JwtModule.register({
        secret: process.env.JWT_SECRET,
      }),
    ],
    providers: [
      LandlordService,
      LandlordResolver,
      {
        provide: getModelToken(Landlord),
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
