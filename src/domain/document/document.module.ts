import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DocumentService } from './document.service';
import { DocumentResolver } from './document.resolver';
import { Document } from './entities/document.entity';
import { BullModule } from '@nestjs/bullmq';
import { DocumentConsumer } from './consumers/document.consumer';
import { BucketModule } from '../../application/bucket/bucket.module';

@Module({
  imports: [
    BucketModule,
    SequelizeModule.forFeature([Document]),
    BullModule.registerQueue({
      name: 'document',
    }),
  ],
  providers: [DocumentResolver, DocumentService, DocumentConsumer],
})
export class DocumentModule {}
