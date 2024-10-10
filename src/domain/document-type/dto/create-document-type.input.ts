import { InputType, Field } from '@nestjs/graphql';
import { isActorType } from '../../validations/applicable-to.validation';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateDocumentTypeInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsNotEmpty()
  @isActorType
  applicableTo: string;
}
