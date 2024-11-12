import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
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

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int)
  addressId: number;

  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Field(() => String, { nullable: true })
  observation?: string;
}
