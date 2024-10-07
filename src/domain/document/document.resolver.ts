import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentService } from './document.service';
import { Document } from './entities/document.entity';
import { UpdateDocumentInput } from './dto/update-document.input';
import { CreateDocumentInput } from './dto/create-document.input';
import {
  BadRequestException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../application/auth/auth.guard';
import { FileOutput } from './dto/create-document.output';
import { RolesGuard } from '../../application/auth/role/role.guard';
import { Roles } from '../../application/auth/role/role.decorator';
import { ERole } from '../../application/auth/role/role.enum';
import { DocumentTypeService } from '../document-type/document-type.service';
import { validateDocumentType } from './validations/type.validation';

@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@Resolver(() => Document)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly documentTypeService: DocumentTypeService,
  ) {}

  @Mutation(() => FileOutput)
  async createDocument(
    @Args('createDocumentInput')
    info: CreateDocumentInput,
  ) {
    const { type } = info;
    const isTypeValid = await validateDocumentType(
      type,
      await this.documentTypeService.findAll(),
    );

    if (!isTypeValid)
      throw new BadRequestException(`${type} isn't a valid type.`);

    return this.documentService.create(info);
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
    const { type } = updateDocumentInput;
    const isTypeValid = await validateDocumentType(
      type,
      await this.documentTypeService.findAll(),
    );

    if (!isTypeValid)
      throw new BadRequestException(`${type} isn't a valid type.`);

    return this.documentService.update(updateDocumentInput);
  }

  @Roles(ERole.Admin)
  @Mutation(() => Boolean)
  removeDocument(@Args('id', { type: () => Int }) id: number) {
    return this.documentService.remove(id);
  }
}
