import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateDocumentInput {
  @Field(() => String)
  type: string;

  @Field(() => String)
  ownerType: string;

  @Field(() => Int)
  ownerId: number;

  @Field(() => String, { nullable: true })
  observation: string;
}
