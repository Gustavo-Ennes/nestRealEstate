import { Module } from '@nestjs/common';
import { DocumentRequirementService } from './document-requirement.service';
import { DocumentRequirementResolver } from './document-requirement.resolver';
import { DocumentTypeModule } from '../document-type/document-type.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { AuthModule } from '../../application/auth/auth.module';

export const documentRequirementModuleObject = {
  imports: [
    SequelizeModule.forFeature([DocumentRequirement]),
    AuthModule,
    DocumentTypeModule,
  ],
  providers: [DocumentRequirementResolver, DocumentRequirementService],
};

@Module(documentRequirementModuleObject)
export class DocumentRequirementModule {}
