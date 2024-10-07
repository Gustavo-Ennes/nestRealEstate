import { InputType, Field, Int } from '@nestjs/graphql';
import { isValidDocumentOwnerType } from '../validations/owner-type.validation';
import { IsNotEmpty } from 'class-validator';
import { FileUpload } from '../document.interface';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@InputType()
export class CreateDocumentInput {
  @IsNotEmpty()
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

  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;
}
