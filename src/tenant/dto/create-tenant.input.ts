import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ContainsCpfOrCnpj } from '../validations/cpf-or-cnpj.validation';
import {
  IsCnpjLength,
  IsCpfLength,
  IsPhoneLength,
} from '../validations/length.validation';
import { IsEmail } from '../validations/email.validation';
import { HasOnlyDigits } from '../validations/only-digits.validation';

@InputType()
export class CreateTenantInput {
  @IsNotEmpty()
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
}
