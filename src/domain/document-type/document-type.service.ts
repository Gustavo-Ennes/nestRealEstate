import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentType } from './entities/document-type.entity';
import { DocumentRequirement } from '../document-requirement/entities/document-requirement.entity';
import { CacheService } from '../../application/cache/cache.service';
import { ModuleNames } from '../../application/cache/cache.utils';

@Injectable()
export class DocumentTypeService {
  constructor(
    @InjectModel(DocumentType)
    private readonly documentTypeModel: typeof DocumentType,
    private readonly cacheService: CacheService,
  ) {}

  private readonly logger = new Logger(DocumentTypeService.name);
  private readonly includeOptions = {
    include: [{ model: DocumentRequirement }],
  };

  async create(
    createDocumentTypeInput: CreateDocumentTypeInput,
  ): Promise<DocumentType> {
    try {
      const documentType: DocumentType = await this.documentTypeModel.create(
        createDocumentTypeInput,
      );
      await documentType.reload(this.includeOptions);
      const documentTypes = await this.documentTypeModel.findAll(
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.DocumentType,
        createdOrUpdated: documentType,
        allEntities: documentTypes,
      });

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
      const cachedDocumentTypes: DocumentType[] =
        (await this.cacheService.getFromCache(
          ModuleNames.DocumentType,
        )) as DocumentType[];

      if (cachedDocumentTypes) return cachedDocumentTypes;

      const documentTypes: DocumentType[] =
        await this.documentTypeModel.findAll(this.includeOptions);

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.DocumentType,
        allEntities: documentTypes,
      });

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
      const cachedDocumentType: DocumentType | null =
        (await this.cacheService.getFromCache(
          ModuleNames.DocumentType,
          id,
        )) as DocumentType;

      if (cachedDocumentType) return cachedDocumentType;

      const documentType: DocumentType = await this.documentTypeModel.findByPk(
        id,
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.Landlord,
        createdOrUpdated: documentType,
      });

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

      await this.documentTypeModel.update(input, { where: { id: input.id } });
      await documentType.reload(this.includeOptions);
      const documentTypes = await this.documentTypeModel.findAll(
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.DocumentType,
        createdOrUpdated: documentType,
        allEntities: documentTypes,
      });

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
      const documentType = await this.documentTypeModel.findByPk(id);

      if (!documentType)
        throw new NotFoundException(
          `DocumentType not found for document id ${id}`,
        );

      await documentType.destroy();
      const documentTypes = await this.documentTypeModel.findAll(
        this.includeOptions,
      );

      await this.cacheService.insertOrUpdateCache({
        moduleName: ModuleNames.DocumentType,
        allEntities: documentTypes,
      });
      await this.cacheService.deleteOneFromCache(ModuleNames.DocumentType, id);

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
