import { InputType, Field, Int } from '@nestjs/graphql';
import { IsValidUsername } from '../validation/username.validation';
import { IsValidPassword } from '../validation/password.validation';
import { IsEmail } from '../../../validations/email.validation';
import { IsValidRole } from '../validation/role.validation';
import { IsOptional, IsNumber } from 'class-validator';

@InputType()
export class SignUpInput {
  @IsValidUsername
  @Field(() => String)
  username: string;

  @IsValidPassword
  @Field(() => String)
  password: string;

  @IsEmail
  @Field(() => String)
  email: string;

  @IsValidRole
  @Field(() => String)
  role: string;

  @IsOptional()
  @IsNumber()
  @Field(() => Int, { nullable: true })
  clientId: number;
}
