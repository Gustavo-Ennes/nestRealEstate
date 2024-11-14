import { TestingModule } from '@nestjs/testing';
import { AddressCronService } from './address.cron';
import { createAddressTestingModule } from '../testConfig/address.test.config';
import { Address } from '../entities/address.entity';
import { getModelToken } from '@nestjs/sequelize';

describe('Address Cron', () => {
  let addressCronService: AddressCronService;
  let addressModel: typeof Address;

  beforeEach(async () => {
    const module: TestingModule = await createAddressTestingModule();

    addressModel = module.get<typeof Address>(getModelToken(Address));
    addressCronService = module.get<AddressCronService>(AddressCronService);
  });

  it('should delete unlinked addresses created more than 24 hours ago', async () => {
    const now = new Date();
    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
    const addresses = [
      {
        //this
        id: 1,
        tenant: null,
        landlord: null,
        client: null,
        createdAt: twentyFiveHoursAgo,
        destroy: jest.fn(),
      },
      {
        id: 2,
        tenant: { id: 1 },
        landlord: null,
        client: null,
        createdAt: twentyFiveHoursAgo,
        destroy: jest.fn(),
      },
      {
        id: 3,
        tenant: null,
        landlord: null,
        client: null,
        createdAt: twentyThreeHoursAgo,
        destroy: jest.fn(),
      },
      {
        id: 4,
        tenant: null,
        landlord: null,
        client: { id: 2 },
        createdAt: twentyThreeHoursAgo,
        destroy: jest.fn(),
      },
      {
        // this
        id: 5,
        tenant: null,
        landlord: null,
        client: null,
        createdAt: twentyFiveHoursAgo,
        destroy: jest.fn(),
      },
      {
        id: 6,
        tenant: null,
        landlord: null,
        client: null,
        createdAt: twentyThreeHoursAgo,
        destroy: jest.fn(),
      },
    ];

    (addressModel.findAll as jest.Mock).mockReturnValueOnce(addresses);
    const unlinkedAddresses = await addressCronService.clearUnlinkedAddresses();

    expect(addresses[0].destroy).toHaveBeenCalled();
    expect(addresses[4].destroy).toHaveBeenCalled();
    expect(addresses[1].destroy).not.toHaveBeenCalled();
    expect(addresses[2].destroy).not.toHaveBeenCalled();
    expect(addresses[3].destroy).not.toHaveBeenCalled();
    expect(addresses[5].destroy).not.toHaveBeenCalled();
    expect(unlinkedAddresses).toEqual({
      deleted: [addresses[0], addresses[4]],
    });
  });
});
