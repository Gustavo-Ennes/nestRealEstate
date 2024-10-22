import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DocumentRequirementService } from './document-requirement.service';
import { DocumentRequirement } from './entities/document-requirement.entity';
import { CreateDocumentRequirementInput } from './dto/create-document-requirement.input';
import { UpdateDocumentRequirementInput } from './dto/update-document-requirement.input';
import { UseGuards, UsePipes } from '@nestjs/common';
import { validationPipe } from '../../application/pipes/validation.pipe';
import { RolesGuard } from '../../application/auth/role/role.guard';
import { Roles } from '../../application/auth/role/role.decorator';
import { ERole } from '../../application/auth/role/role.enum';
import { AuthGuard } from '../../application/auth/auth.guard';

@UsePipes(validationPipe)
@UseGuards(AuthGuard, RolesGuard)
@Resolver(() => DocumentRequirement)
export class DocumentRequirementResolver {
  constructor(
    private readonly documentRequirementService: DocumentRequirementService,
  ) {}

  @Roles(ERole.Admin)
  @Mutation(() => DocumentRequirement)
  createDocumentRequirement(
    @Args('createDocumentRequirementInput')
    createDocumentRequirementInput: CreateDocumentRequirementInput,
  ) {
    return this.documentRequirementService.create(
      createDocumentRequirementInput,
    );
  }

  @Query(() => [DocumentRequirement], { name: 'documentRequirements' })
  findAll() {
    return this.documentRequirementService.findAll();
  }

  @Query(() => DocumentRequirement, { name: 'documentRequirement' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.documentRequirementService.findOne(id);
  }

  @Roles(ERole.Admin)
  @Mutation(() => DocumentRequirement)
  updateDocumentRequirement(
    @Args('updateDocumentRequirementInput')
    updateDocumentRequirementInput: UpdateDocumentRequirementInput,
  ) {
    return this.documentRequirementService.update(
      updateDocumentRequirementInput,
    );
  }

  @Roles(ERole.Admin)
  @Mutation(() => Boolean)
  removeDocumentRequirement(@Args('id', { type: () => Int }) id: number) {
    return this.documentRequirementService.remove(id);
  }
}
