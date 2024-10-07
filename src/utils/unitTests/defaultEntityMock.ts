import { getModelToken } from '@nestjs/sequelize';
import { Model } from 'sequelize-typescript';

export function getMockedEntityProvider<T extends Model<T>>(model: {
  new (): T;
}) {
  return {
    provide: getModelToken(model),
    useValue: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      reload: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      save: jest.fn(),
    },
  };
}
