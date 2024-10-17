import { Module } from '@nestjs/common';
import { DocumentRequirementService } from './document-requirement.service';
import { DocumentRequirementResolver } from './document-requirement.resolver';
import { DocumentTypeModule } from '../document-type/document-type.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentRequirement } from './entities/document-requirement.entity';

export const documentRequirementModuleObject = {
  imports: [
    SequelizeModule.forFeature([DocumentRequirement]),
    DocumentTypeModule,
  ],
  providers: [DocumentRequirementResolver, DocumentRequirementService],
};

@Module(documentRequirementModuleObject)
export class DocumentRequirementModule {}
