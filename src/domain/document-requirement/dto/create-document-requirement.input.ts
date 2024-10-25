import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { isValidDocumentOwnerRole } from '../../../validations/owner-role.validation';

@InputType()
export class CreateDocumentRequirementInput {
  @Field(() => Int)
  @IsNotEmpty()
  documentTypeId: number;

  @IsNotEmpty()
  @isValidDocumentOwnerRole
  @Field(() => String)
  role: string;

  @Field(() => Boolean, { defaultValue: true })
  isRequired?: boolean;
}
