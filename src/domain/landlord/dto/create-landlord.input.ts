import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ContainsCpfOrCnpj } from '../../../validations/cpf-or-cnpj.validation';
import {
  IsCnpjLength,
  IsCpfLength,
  IsPhoneLength,
} from '../../../validations/length.validation';
import { IsEmail } from '../../../validations/email.validation';
import { HasOnlyDigits } from '../../../validations/only-digits.validation';
import { HasOnlyLetters } from '../../../validations/only-letters.validation';

@InputType()
export class CreateLandlordInput {
  @IsNotEmpty()
  @HasOnlyLetters
  @Field(() => String)
  name: string;

  @IsCpfLength
  @ContainsCpfOrCnpj('cnpj')
  @HasOnlyDigits
  @Field(() => String, { nullable: true })
  cpf: string;

  @IsCnpjLength
  @HasOnlyDigits
  @Field(() => String, { nullable: true })
  cnpj: string;

  @IsNotEmpty()
  @IsEmail
  @Field(() => String)
  email: string;

  @IsNotEmpty()
  @IsPhoneLength
  @HasOnlyDigits
  @Field(() => String)
  phone: string;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int)
  clientId: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int)
  addressId: number;
}
