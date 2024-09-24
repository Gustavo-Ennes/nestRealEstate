import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { LandlordModule } from './landlord/landlord.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [TenantModule, DocumentModule, LandlordModule],
})
export class DomainModule {}
