import { CreateDocumentRequirementInput } from './create-document-requirement.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentRequirementInput extends PartialType(
  CreateDocumentRequirementInput,
) {
  @Field(() => Int)
  id: number;
}
