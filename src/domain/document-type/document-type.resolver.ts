import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentTypeService } from './document-type.service';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../application/auth/auth.guard';
import { RolesGuard } from '../../application/auth/role/role.guard';
import { Roles } from '../../application/auth/role/role.decorator';
import { ERole } from '../../application/auth/role/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => DocumentType)
export class DocumentTypeResolver {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Roles(ERole.Admin)
  @Mutation(() => DocumentType)
  createDocumentType(
    @Args('createDocumentTypeInput')
    createDocumentTypeInput: CreateDocumentTypeInput,
  ) {
    return this.documentTypeService.create(createDocumentTypeInput);
  }

  @Roles(ERole.Admin)
  @Query(() => [DocumentType], { name: 'documentTypes' })
  findAll() {
    return this.documentTypeService.findAll();
  }

  @Roles(ERole.Admin)
  @Query(() => DocumentType, { name: 'documentType', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.documentTypeService.findOne(id);
  }

  @Roles(ERole.Admin)
  @Mutation(() => DocumentType)
  updateDocumentType(
    @Args('updateDocumentTypeInput')
    updateDocumentTypeInput: UpdateDocumentTypeInput,
  ) {
    return this.documentTypeService.update(updateDocumentTypeInput);
  }

  @Roles(ERole.Admin)
  @Mutation(() => Boolean)
  removeDocumentType(@Args('id', { type: () => Int }) id: number) {
    return this.documentTypeService.remove(id);
  }
}
