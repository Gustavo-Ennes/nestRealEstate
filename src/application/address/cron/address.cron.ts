import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Address } from '../entities/address.entity';
import { Tenant } from '../../../domain/tenant/entities/tenant.entity';
import { Landlord } from '../../../domain/landlord/entities/landlord.entity';
import { Client } from '../../../application/client/entities/client.entity';

@Injectable()
export class AddressCronService {
  constructor(
    @InjectModel(Address) private readonly addressModel: typeof Address,
    private readonly scheduleRegistry: SchedulerRegistry,
  ) {}

  private readonly logger = new Logger(AddressCronService.name);

  // This cron job, scheduled to run every day at 2 AM, checks for addresses that are unlinked (i.e., not associated with any tenant, landlord, or client)
  // and were created more than 24 hours ago. It then deletes these unlinked addresses from the database and logs the number of deletions.
  @Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'clearUnlinkedAddresses' })
  async clearUnlinkedAddresses() {
    this.logger.log(`RemoveUnlinkedAddresses cron job started.`);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const addresses = await this.addressModel.findAll({
      include: [{ model: Tenant }, { model: Landlord }, { model: Client }],
    });
    const unlinkedAddresses = addresses.filter(
      (address) =>
        !address.tenant &&
        !address.landlord &&
        !address.client &&
        new Date(address.createdAt) < twentyFourHoursAgo,
    );

    for (const address of unlinkedAddresses) {
      await address.destroy();
    }

    this.logger.log(`Deleted ${unlinkedAddresses.length} unlinked addresses.`);

    return {
      deleted: unlinkedAddresses,
    };
  }

  getScheduleRegistry() {
    return this.scheduleRegistry;
  }
}
