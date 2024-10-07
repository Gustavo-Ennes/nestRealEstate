import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentTypeInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  applicableTo: string;
}
