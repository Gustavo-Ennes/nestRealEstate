import { Injectable, Logger } from '@nestjs/common';
import { UpdateDocumentInput } from './dto/update-document.input';
import { FileUpload } from './document.interface';
import { User } from '../user/entities/user.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

@Injectable()
export class DocumentService {
  constructor(
    @InjectQueue('document')
    private documentQueue: Queue,
  ) {}

  private readonly logger = new Logger(DocumentService.name);

  async create(
    document: Promise<FileUpload>,
    user: User,
    documentInfo: CreateDocumentInput,
  ): Promise<{ jobId: string }> {
    try {
      const { createReadStream, filename } = await document;

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
          user,
          documentInfo,
        },
        { attempts: 3 },
      );

      this.logger.log('job added to queue.');

      return { jobId: documentJob.id };
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createUserInput: { document } },
      );
      throw error;
    }
  }

  findAll() {
    return `This action returns all document`;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  async update(id: number, updateDocumentInput: UpdateDocumentInput) {
    return await Promise.resolve(null);
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
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
