import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDocumentRequirementInput } from './dto/create-document-requirement.input';
import { UpdateDocumentRequirementInput } from './dto/update-document-requirement.input';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { DocumentType } from '../document-type/entities/document-type.entity';
import { DocumentTypeService } from '../document-type/document-type.service';

@Injectable()
export class DocumentRequirementService {
  constructor(
    @InjectModel(DocumentRequirement)
    private readonly documentRequirementModel: typeof DocumentRequirement,
    private readonly documentTypeService: DocumentTypeService,
  ) {}

  private readonly logger = new Logger(DocumentRequirementService.name);
  private readonly includeOptions = { include: [{ model: DocumentType }] };

  async create(createDocumentRequirementInput: CreateDocumentRequirementInput) {
    let documentType: DocumentType;
    const { documentTypeId } = createDocumentRequirementInput;

    try {
      if (documentTypeId)
        documentType = await this.documentTypeService.findOne(documentTypeId);

      if (documentTypeId && !documentType)
        throw new NotFoundException(
          'Document type not found with provided documentTypeId',
        );

      const documentRequirement = await this.documentRequirementModel.create(
        createDocumentRequirementInput,
      );
      await documentRequirement.reload(this.includeOptions);

      return documentRequirement;
    } catch (error) {
      this.logger.error(
        `${this.create.name} -> ${error.message}`,
        error.stack,
        { createDocumentRequirementInput },
      );
      throw error;
    }
  }

  async findAll() {
    try {
      const documentRequirements = await this.documentRequirementModel.findAll(
        this.includeOptions,
      );

      return documentRequirements;
    } catch (error) {
      this.logger.error(
        `${this.findAll.name} -> ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const documentRequirement = await this.documentRequirementModel.findByPk(
        id,
        this.includeOptions,
      );

      return documentRequirement;
    } catch (error) {
      this.logger.error(
        `${this.findOne.name} -> ${error.message}`,
        error.stack,
        { id },
      );
      throw error;
    }
  }

  async update(updateDocumentRequirementInput: UpdateDocumentRequirementInput) {
    try {
      let documentType: DocumentType;
      const { id, documentTypeId } = updateDocumentRequirementInput;
      const documentRequirementToUpdate =
        await this.documentRequirementModel.findByPk(id);

      if (!documentRequirementToUpdate)
        throw new NotFoundException(
          'No document requirement found with provided id.',
        );

      if (documentTypeId)
        documentType = await this.documentTypeService.findOne(documentTypeId);

      if (documentTypeId && !documentType)
        throw new NotFoundException(
          'Document type not found with provided documentTypeId',
        );

      await this.documentRequirementModel.update(
        updateDocumentRequirementInput,
        {
          where: { id },
        },
      );
      await documentRequirementToUpdate.reload(this.includeOptions);

      return documentRequirementToUpdate;
    } catch (error) {
      this.logger.error(
        `${this.update.name} -> ${error.message}`,
        error.stack,
        { updateDocumentRequirementInput },
      );
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const documentRequirementToRemove =
        await this.documentRequirementModel.findByPk(id);

      if (!documentRequirementToRemove)
        throw new NotFoundException(
          'No document requirement found with provided id.',
        );

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
