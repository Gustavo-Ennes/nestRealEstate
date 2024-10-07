import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bullmq';
import { DocumentService } from './document.service';
import { DocumentResolver } from './document.resolver';
import { Document } from './entities/document.entity';
import { DocumentConsumer } from './consumers/document.consumer';
import { BucketModule } from '../../application/bucket/bucket.module';
import { AuthModule } from '../../application/auth/auth.module';
import { DocumentTypeModule } from '../document-type/document-type.module';

export const documentModuleObject = {
  imports: [
    AuthModule,
    SequelizeModule.forFeature([Document]),
    BullModule.registerQueue({
      name: 'document',
    }),
    BullBoardModule.forFeature({
      name: 'document',
      adapter: BullMQAdapter,
    }),
    DocumentTypeModule,
    BucketModule,
  ],
  providers: [DocumentResolver, DocumentService, DocumentConsumer],
  exports: [DocumentService],
};

@Module(documentModuleObject)
export class DocumentModule {}
