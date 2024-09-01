import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { IsEmail } from '../../tenant/validations/email.validation';
import { IsValidPassword } from '../validation/signup.validation';
import { IsValidRole } from '../validation/role.validation';

@InputType()
export class CreateUserInput {
  @IsNotEmpty()
  @Field(() => String)
  username: string;

  @IsNotEmpty()
  @IsEmail
  @Field(() => String)
  email: string;

  @IsNotEmpty()
  @IsValidPassword
  @Field(() => String)
  password: string;

  @IsNotEmpty()
  @IsValidRole
  @Field(() => String)
  role: string;
}
