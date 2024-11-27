import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bullmq';
import { BucketService } from '../../../application/bucket/bucket.service';
import { Document } from '../entities/document.entity';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { CacheService } from '../../../application/cache/cache.service';
import { ModuleNames } from '../../../application/cache/cache.utils';

@Processor('document')
export class DocumentConsumer extends WorkerHost {
  constructor(
    @InjectModel(Document)
    private readonly documentModel: typeof Document,
    private readonly bucketService: BucketService,
    private readonly cacheService: CacheService,
  ) {
    super();
  }

  private readonly logger = new Logger(DocumentConsumer.name);

  async process(job: Job): Promise<any> {
    let progress = 0;
    const { documentInfo } = job.data;

    try {
      const destFileName = await this.bucketService.uploadToBucket(job.data);

      progress = 50;
      await job.updateProgress(progress);

      const document = await this.documentModel.create({
        ...documentInfo,
        url: destFileName,
      });
      const documents = await this.documentModel.findAll();

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Document,
        createdOrUpdated: document,
        allEntities: documents,
      });

      progress = 100;
      await job.updateProgress(progress);

      this.logger.log(
        `Queue ${job.queueName?.toUpperCase()}: job ${job.id} was processed successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `${this.process.name} -> ${error.message}`,
        error.stack,
        { createUserInput: { document } },
      );

      throw error;
    } finally {
      this.deleteTempFile(job.data.tempFilePath);
    }
  }

  deleteTempFile(filePath: string): void {
    fs.unlink(filePath, () => null);
  }
}
