import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentRequirementService } from './document-requirement.service';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { CreateDocumentRequirementInput } from './dto/create-document-requirement.input';
import { UpdateDocumentRequirementInput } from './dto/update-document-requirement.input';

@Resolver(() => DocumentRequirement)
export class DocumentRequirementResolver {
  constructor(
    private readonly documentRequirementService: DocumentRequirementService,
  ) {}

  @Mutation(() => DocumentRequirement)
  createDocumentRequirement(
    @Args('createDocumentRequirementInput')
    createDocumentRequirementInput: CreateDocumentRequirementInput,
  ) {
    return this.documentRequirementService.create(
      createDocumentRequirementInput,
    );
  }

  @Query(() => [DocumentRequirement], { name: 'documentRequirement' })
  findAll() {
    return this.documentRequirementService.findAll();
  }

  @Query(() => DocumentRequirement, { name: 'documentRequirement' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.documentRequirementService.findOne(id);
  }

  @Mutation(() => DocumentRequirement)
  updateDocumentRequirement(
    @Args('updateDocumentRequirementInput')
    updateDocumentRequirementInput: UpdateDocumentRequirementInput,
  ) {
    return this.documentRequirementService.update(
      updateDocumentRequirementInput,
    );
  }

  @Mutation(() => DocumentRequirement)
  removeDocumentRequirement(@Args('id', { type: () => Int }) id: number) {
    return this.documentRequirementService.remove(id);
  }
}
