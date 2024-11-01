import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { IsEmail } from '../../../validations/email.validation';
import {
  IsCnpjLength,
  IsPhoneLength,
} from '../../../validations/length.validation';
import { HasOnlyDigits } from '../../../validations/only-digits.validation';
import { IsSite } from '../../../validations/site.validation';
import { HasOnlyLetters } from '../../../validations/only-letters.validation';

@InputType()
export class CreateClientInput {
  @IsNotEmpty()
  @Field(() => Int)
  userId: number;

  @IsNotEmpty()
  @HasOnlyLetters
  @Field(() => String)
  name: string;

  @IsNotEmpty()
  @IsPhoneLength
  @HasOnlyDigits
  @Field(() => String)
  phone: string;

  @IsNotEmpty()
  @IsEmail
  @Field(() => String)
  email: string;

  @IsSite
  @Field(() => String, { nullable: true })
  site?: string;

  @IsNotEmpty()
  @HasOnlyDigits
  @IsCnpjLength
  @Field(() => String)
  cnpj: string;

  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Field(() => String, { nullable: true })
  observation?: string;
}
