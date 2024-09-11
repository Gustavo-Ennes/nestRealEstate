import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { CreateDocumentInput } from '../document/dto/create-document.input';
import { User } from '../user/entities/user.entity';

interface IUploadToBucket {
  tempFilePath: string;
  user: User;
  documentInfo: CreateDocumentInput;
}

@Injectable()
export class BucketService {
  private readonly logger = new Logger(BucketService.name);
  private readonly bucketName = process.env.BUCKET_NAME;

  async uploadToBucket({
    tempFilePath,
    user,
    documentInfo,
  }: IUploadToBucket): Promise<string> {
    const destFileName = `documents/${documentInfo.ownerType}/${documentInfo.ownerId}/${documentInfo.type}/${Date.now().toString()}.pdf`;

    try {
      const storage = new Storage();
      const bucket = storage.bucket(this.bucketName);

      await bucket.upload(tempFilePath, { destination: destFileName });

      return destFileName;
    } catch (error) {
      this.logger.error(
        `${this.uploadToBucket.name} -> ${error.message}`,
        error.stack,
        { user, documentInfo },
      );

      throw error;
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    const storage = new Storage();
    const bucket = storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    try {
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      this.logger.error(
        `${this.fileExists.name} -> ${error.message}`,
        error.stack,
        { fileName },
      );

      throw error;
    }
  }
}
