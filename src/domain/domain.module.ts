import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';
import { LandlordModule } from './landlord/landlord.module';
import { TenantModule } from './tenant/tenant.module';
import { DocumentTypeModule } from './document-type/document-type.module';
import { DocumentRequirementModule } from './document-requirement/document-requirement.module';

@Module({
  imports: [
    DocumentTypeModule,
    DocumentModule,
    TenantModule,
    LandlordModule,
    DocumentRequirementModule,
  ],
})
export class DomainModule {}
