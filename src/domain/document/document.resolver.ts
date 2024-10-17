import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentService } from './document.service';
import { Document } from './entities/document.entity';
import { UpdateDocumentInput } from './dto/update-document.input';
import { CreateDocumentInput } from './dto/create-document.input';
import {
  BadRequestException,
  Logger,
  NotFoundException,
  NotImplementedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '../../application/auth/auth.guard';
import { FileOutput } from './dto/create-document.output';
import { RolesGuard } from '../../application/auth/role/role.guard';
import { Roles } from '../../application/auth/role/role.decorator';
import { ERole } from '../../application/auth/role/role.enum';
import { DocumentTypeService } from '../document-type/document-type.service';
import { validateDocumentType } from './validations/type.validation';
import { TenantService } from '../tenant/tenant.service';
import { LandlordService } from '../landlord/landlord.service';
import { Tenant } from '../tenant/entities/tenant.entity';
import { Landlord } from '../landlord/entities/landlord.entity';
import { validationPipe } from '../../application/pipes/validation.pipe';

@UseGuards(AuthGuard, RolesGuard)
@UsePipes(validationPipe)
@Resolver(() => Document)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly documentTypeService: DocumentTypeService,
    private readonly tenantService: TenantService,
    private readonly landlordService: LandlordService,
  ) {}

  private readonly logger = new Logger(DocumentResolver.name);

  @Mutation(() => FileOutput)
  async createDocument(
    @Args('createDocumentInput')
    info: CreateDocumentInput,
  ) {
    let owner: Tenant | Landlord;
    const { type, ownerRole, ownerId, file } = info;

    try {
      const isTypeValid = await validateDocumentType(
        type,
        await this.documentTypeService.findAll(),
      );

      if (!isTypeValid)
        throw new BadRequestException(`${type} isn't a valid type.`);

      // TODO change with Guarantor entity implementation
      switch (ownerRole) {
        case ERole.Tenant:
          owner = await this.tenantService.findOne(ownerId);
          break;
        case ERole.Landlord:
          owner = await this.landlordService.findOne(ownerId);
          break;
        case ERole.Guarantor:
          throw new NotImplementedException();
      }
      // TODO test this!
      if (!owner)
        throw new BadRequestException(
          `No ${ownerRole} found with provided id.`,
        );

      if (!file) throw new BadRequestException(`File not provided.`);

      return this.documentService.create(info);
    } catch (error) {
      this.logger.error(
        `${this.createDocument.name} -> ${error.message}`,
        error.stack,
        {
          createDocumentInput: info,
        },
      );
      throw error;
    }
  }

  @Roles(ERole.Admin)
  @Query(() => [Document], { name: 'documents' })
  findAll() {
    return this.documentService.findAll();
  }

  @Query(() => Document, { name: 'document', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.documentService.findOne(id);
  }

  @Mutation(() => Document)
  async updateDocument(
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
  ) {
    let owner: Tenant | Landlord;
    const { type, ownerRole, ownerId, id } = updateDocumentInput;
    try {
      const isTypeValid = await validateDocumentType(
        type,
        await this.documentTypeService.findAll(),
      );
      const documentToUpdate = await this.documentService.findOne(id);

      if (!documentToUpdate) throw new NotFoundException('Document not found.');

      if (type && !isTypeValid)
        throw new BadRequestException(`${type} isn't a valid type.`);

      // TODO change with Guarantor entity implementation
      const actualOwnerType = ownerRole ?? documentToUpdate.ownerRole;
      const actualOwnerId = ownerId ?? documentToUpdate.ownerId;

      switch (actualOwnerType) {
        case ERole.Tenant:
          owner = await this.tenantService.findOne(actualOwnerId);
          break;
        case ERole.Landlord:
          owner = await this.landlordService.findOne(actualOwnerId);
          break;
        case ERole.Guarantor:
          throw new NotImplementedException();
      }
      // }

      if (!owner)
        throw new BadRequestException(
          `No ${actualOwnerType} found with provided id.`,
        );

      return this.documentService.update(updateDocumentInput);
    } catch (error) {
      this.logger.error(
        `${this.updateDocument.name} -> ${error.message}`,
        error.stack,
        {
          updateDocumentInput,
        },
      );
      throw error;
    }
  }

  @Roles(ERole.Admin)
  @Mutation(() => Boolean)
  removeDocument(@Args('id', { type: () => Int }) id: number) {
    return this.documentService.remove(id);
  }
}
