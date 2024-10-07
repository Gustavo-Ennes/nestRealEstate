import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeResolver } from './document-type.resolver';
import { DocumentType } from './entities/document-type.entity';
import { AuthModule } from '../../application/auth/auth.module';

export const documentTypeModuleObject = {
  imports: [SequelizeModule.forFeature([DocumentType]), AuthModule],
  providers: [DocumentTypeResolver, DocumentTypeService],
  exports: [DocumentTypeService],
};

@Module(documentTypeModuleObject)
export class DocumentTypeModule {}
