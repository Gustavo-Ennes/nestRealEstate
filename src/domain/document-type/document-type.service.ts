import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentType } from './entities/document-type.entity';

@Injectable()
export class DocumentTypeService {
  constructor(
    @InjectModel(DocumentType)
    private readonly documentTypeModel: typeof DocumentType,
  ) {}

  private readonly logger = new Logger(DocumentTypeService.name);

  async create(
    createDocumentTypeInput: CreateDocumentTypeInput,
  ): Promise<DocumentType> {
    try {
      const documentType: DocumentType = await this.documentTypeModel.create(
        createDocumentTypeInput,
      );

      return documentType;
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createDocumentTypeInput },
      );
      throw error;
    }
  }

  async findAll(): Promise<DocumentType[]> {
    try {
      const documentTypes: DocumentType[] =
        await this.documentTypeModel.findAll();

      return documentTypes;
    } catch (error) {
      this.logger.error(
        `${this.findAll.name} -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<DocumentType | null> {
    try {
      const documentType: DocumentType | null =
        await this.documentTypeModel.findOne({ where: { id } });

      return documentType;
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }

  async update(input: UpdateDocumentTypeInput): Promise<DocumentType> {
    try {
      const documentType = await this.documentTypeModel.findOne({
        where: { id: input.id },
      });

      if (!documentType)
        throw new NotFoundException(
          `Documenttype not found for document id ${input.id}`,
        );

      if (input.name) documentType.name = input.name;
      if (input.applicableTo) documentType.applicableTo = input.applicableTo;

      await this.documentTypeModel.update(input, { where: { id: input.id } });
      await documentType.reload();

      return documentType;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { updateDocumentTypeInput: input },
      );
      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const documentType = await this.documentTypeModel.findOne({
        where: { id },
      });

      if (!documentType)
        throw new NotFoundException(
          `DocumentType not found for document id ${id}`,
        );

      await documentType.destroy();
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
}
