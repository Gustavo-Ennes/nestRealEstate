import { INestApplication } from '@nestjs/common';
import { Address } from '../../../src/application/address/entities/address.entity';
import { AddressCronService } from '../../../src/application/address/cron/address.cron';
import { AddressService } from '../../../src/application/address/address.service';
import { Sequelize } from 'sequelize-typescript';
import { initApp } from '../../utils';
import { Landlord } from '../../../src/domain/landlord/entities/landlord.entity';
import { pluck } from 'ramda';

describe('Address Cron Job (e2e)', () => {
  let app: INestApplication;
  let addressCronService: AddressCronService;
  let addressService: AddressService;
  let sequelize: Sequelize;
  const now = new Date();
  const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  const twentyOneHoursAgo = new Date(now.getTime() - 21 * 60 * 60 * 1000);

  beforeEach(async () => {
    const { application, db } = await initApp();
    app = application;
    sequelize = db;

    addressCronService = app.get<AddressCronService>(AddressCronService);
    addressService = app.get<AddressService>(AddressService);

    await sequelize.getQueryInterface().dropAllTables();
    await sequelize.sync({ force: true });

    await Address.create({
      tenant: null,
      landlord: null,
      client: null,
      createdAt: twentyFiveHoursAgo,
    });
    await Address.create({
      tenant: null,
      landlord: null,
      client: null,
      createdAt: now,
    });
    await Address.create({
      tenant: null,
      landlord: { id: 1 } as Landlord,
      client: null,
      createdAt: twentyOneHoursAgo,
    });
    await Address.create({
      tenant: null,
      landlord: null,
      client: null,
      createdAt: twentyOneHoursAgo,
    });
    await Address.create({
      tenant: null,
      landlord: null,
      client: null,
      createdAt: twentyOneHoursAgo,
    });
    await Address.create({
      //this
      tenant: null,
      landlord: null,
      client: null,
      createdAt: twentyFiveHoursAgo,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should remove unliked addresses older than 24 hours', async () => {
    const deletedAddresses = await addressCronService.clearUnlinkedAddresses();
    const linkedAddresses = await addressService.findAll();
    const deletedIds = pluck('id', deletedAddresses.deleted);
    const linkedIds = pluck('id', linkedAddresses);

    expect(deletedAddresses).toHaveProperty('deleted');
    expect(deletedAddresses.deleted).toHaveLength(2);
    expect(deletedIds).toContain(1);
    expect(deletedIds).toContain(6);
    expect(linkedAddresses).toHaveLength(4);
    expect(linkedIds).toContain(2);
    expect(linkedIds).toContain(3);
    expect(linkedIds).toContain(4);
    expect(linkedIds).toContain(5);
  });
});
