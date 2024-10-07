import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { Queue } from 'bullmq';
import { dissoc } from 'ramda';
import { UpdateDocumentInput } from './dto/update-document.input';
import { CreateDocumentInput } from './dto/create-document.input';
import { Document } from './entities/document.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class DocumentService {
  constructor(
    @InjectQueue('document')
    private documentQueue: Queue,
    @InjectModel(Document)
    private readonly documentModel: typeof Document,
  ) {}

  private readonly logger = new Logger(DocumentService.name);

  async create(documentInfo: CreateDocumentInput): Promise<{ jobId: string }> {
    try {
      const { createReadStream, filename } = await documentInfo.file;

      const chunks: Buffer[] = [];
      const stream = createReadStream();

      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      const fileBuffer = Buffer.concat(chunks);

      const tempFilePath = await this.createTempFile(fileBuffer, filename);

      const documentJob = await this.documentQueue.add(
        'uploadAndSave',
        {
          tempFilePath,
          documentInfo,
        },
        { attempts: 3 },
      );

      this.logger.log(
        `Queue ${documentJob?.queueName?.toUpperCase()}: job ${documentJob?.id} was added.`,
      );

      return { jobId: documentJob.id };
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { documentInfo },
      );
      throw error;
    }
  }

  async findAll(): Promise<Document[]> {
    try {
      const documents: Document[] = await this.documentModel.findAll();
      return documents;
    } catch (error) {
      this.logger.error(
        `${this.findAll.name} -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<Document> {
    try {
      const document: Document = await this.documentModel.findOne({
        where: { id },
      });
      return document;
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }

  async update(updateDocumentInput: UpdateDocumentInput): Promise<Document> {
    try {
      const { id } = updateDocumentInput;
      const inputWithoutId = dissoc('id', updateDocumentInput);
      const document: Document = await this.documentModel.findOne({
        where: { id },
      });

      if (!document) throw new NotFoundException('Document not found.');

      await this.documentModel.update(inputWithoutId, { where: { id } });
      await document.reload();

      return document;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { updateDocumentInput },
      );
      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const document: Document = await this.documentModel.findOne({
        where: { id },
      });

      if (!document) throw new NotFoundException('Document not found.');

      await document.destroy();

      return true;
    } catch (error) {
      this.logger.error(
        `${this.remove.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }

  async createTempFile(
    fileBuffer: Buffer,
    originalName: string,
  ): Promise<string> {
    const tempDir = os.tmpdir();
    const tempFileName = `${Date.now()}-${originalName}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await fs.promises.writeFile(tempFilePath, fileBuffer);

    return tempFilePath;
  }
}
