import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { DocumentService } from './document.service';
import { Document } from './entities/document.entity';
import { UpdateDocumentInput } from './dto/update-document.input';
import { FileUpload } from './document.interface';
import { CreateDocumentInput } from './dto/create-document.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FileOutput } from './dto/create-document.output';
import { RolesGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/role/role.decorator';
import { Role } from '../auth/role/role.enum';

@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => Document)
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Mutation(() => FileOutput)
  async createDocument(
    @Args('document', { type: () => GraphQLUpload })
    document: Promise<FileUpload>,
    @Args('createDocumentInput')
    info: CreateDocumentInput,
  ) {
    return this.documentService.create(document, info);
  }

  @Query(() => [Document], { name: 'documents' })
  @Roles(Role.Admin)
  findAll() {
    return this.documentService.findAll();
  }

  @Query(() => Document, { name: 'document' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.documentService.findOne(id);
  }

  @Mutation(() => Document)
  updateDocument(
    @Args('updateDocumentInput') updateDocumentInput: UpdateDocumentInput,
  ) {
    return this.documentService.update(
      updateDocumentInput.id,
      updateDocumentInput,
    );
  }

  @Mutation(() => Document)
  removeDocument(@Args('id', { type: () => Int }) id: number) {
    return this.documentService.remove(id);
  }
}
