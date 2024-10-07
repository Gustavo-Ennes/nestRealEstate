import { CreateDocumentTypeInput } from './create-document-type.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentTypeInput extends PartialType(
  CreateDocumentTypeInput,
) {
  @Field(() => Int)
  id: number;
}
