import { InputType, Field, Int } from '@nestjs/graphql';
import { isValidDocumentType } from '../validations/type.validation';
import { isValidDocumentOwnerType } from '../validations/owner-type.validation';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateDocumentInput {
  @IsNotEmpty()
  @isValidDocumentType
  @Field(() => String)
  type: string;

  @IsNotEmpty()
  @isValidDocumentOwnerType
  @Field(() => String)
  ownerType: string;

  @IsNotEmpty()
  @Field(() => Int)
  ownerId: number;

  @Field(() => String, { nullable: true })
  observation?: string;
}
